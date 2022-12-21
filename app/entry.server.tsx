import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "remix";
import { json, RemixServer } from "remix";
import dotenv from "dotenv";
import { getGardenReplica, getStorageHash } from "./workspace/storage.server";
import { Doc, Peer, Syncer } from "earthstar";
import {
  TransportHttpClient,
  TransportHttpServer,
} from "earthstar-streaming-rpc";
import { ES_AUTHOR_ADDRESS } from "./constants";
import { lobbyRss, postsRss } from "./rss.server";
import { getPost } from "./workspace/posts.server";
import etag from "./etag.server";
import { getInstanceURLs } from "./workspace/instances.server";

dotenv.config();

// Start syncing with other instances.

const peer = new Peer();
const replica = getGardenReplica();

if (replica) {
  peer.addReplica(replica);
}

getInstanceURLs().then((instances) => {
  const syncer = new Syncer(peer, (methods) => {
    return new TransportHttpClient({
      deviceId: peer.peerId,
      methods,
    });
  });

  for (const instance of instances) {
    console.log(`${process.env.FLY_REGION}: syncing with ${instance}`);
    syncer.transport.addConnection(`${instance}/earthstar-api/v2`);
  }
});

const serverSyncer = new Syncer(peer, (methods) => {
  return new TransportHttpServer({
    deviceId: peer.peerId,
    methods,
    path: "/earthstar-api/v2/",
  });
});

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  if (process.env.NODE_ENV !== "production") {
    responseHeaders.set("Cache-Control", "no-store");
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.pathname === `/${process.env.GARDEN_WORKSPACE}/store-hash`) {
    return new Response(getStorageHash(), {
      status: 200,
    });
  }

  if (requestUrl.pathname.startsWith("/posts/")) {
    const slug = new URL(request.url).pathname.replace("/posts/", "");

    const post = await getPost(slug);

    if (post) {
      const postEtag = etag(post.contentHash, { weak: true });

      if (postEtag === request.headers.get("If-None-Match")) {
        return new Response("", { status: 304 });
      }
    }
  }

  if (requestUrl.pathname === "/rss/posts.xml") {
    return new Response(await postsRss(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }

  if (requestUrl.pathname === "/rss/microposts.xml") {
    return new Response(await lobbyRss(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }

  const { pathname } = requestUrl;
  const API_PREFIX = `/earthstar-api/v1/${process.env.GARDEN_WORKSPACE}`;
  const API_2_PREFIX = `/earthstar-api/v2`;

  if (pathname.startsWith(API_2_PREFIX)) {
    console.log(request);

    const res = serverSyncer.transport.handler(request as unknown as any);

    console.log(res);

    return res;
  }

  if (pathname.startsWith(API_PREFIX)) {
    const replica = getGardenReplica();

    if (!replica) {
      return new Response(undefined, {
        status: 404,
      });
    }

    // list paths
    // /earthstar-api/v1/:workspace/paths
    if (
      pathname === `${API_PREFIX}/paths` &&
      request.method === "GET"
    ) {
      const docs = await replica.getLatestDocs();
      const paths = docs.map(({ path }) => path);

      return json(paths, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // get all documents
    // /earthstar-api/v1/:workspace/documents
    if (
      pathname === `${API_PREFIX}/documents` &&
      request.method === "GET"
    ) {
      const docs = replica.getAllDocs();

      return json(docs, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (
      pathname === `${API_PREFIX}/documents` &&
      request.method === "OPTIONS"
    ) {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ingest documents (uploaded from client)
    // /earthstar-api/v1/:workspace/documents

    if (
      pathname === `${API_PREFIX}/documents` &&
      request.method === "POST"
    ) {
      const docs: Doc[] = await request.json();

      let numIngested = 0;
      for (let doc of docs) {
        // Only sync docs from gwil
        if (doc.author !== ES_AUTHOR_ADDRESS) {
          return;
        }

        const result = await replica.ingest(doc);

        if (result.kind === "success") {
          numIngested += 1;
        }
      }

      const results = {
        numIngested: numIngested,
        numIgnored: docs.length - numIngested,
        numTotal: docs.length,
      };

      return json(results, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Don't do live streaming.
  }

  let markup = ReactDOMServer.renderToString(
    <RemixServer context={remixContext} url={request.url} />,
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
