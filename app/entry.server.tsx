import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "remix";
import { RemixServer, json } from "remix";
import dotenv from "dotenv";
import { getGardenStorage } from "./workspace/storage.server";
import { Document, WriteResult } from "earthstar";
import { ES_AUTHOR_ADDRESS } from "./constants";
import { postsRss } from "./rss.server";
import { getPost } from "./workspace/posts.server";
import etag from "./etag.server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  dotenv.config();

  if (process.env.NODE_ENV !== "production") {
    responseHeaders.set("Cache-Control", "no-store");
  }

  if (new URL(request.url).pathname.startsWith("/posts/")) {
    const slug = new URL(request.url).pathname.replace("/posts/", "");

    const post = await getPost(slug);

    if (post) {
      const postEtag = etag(post.contentHash, { weak: true });

      if (postEtag === request.headers.get("If-None-Match")) {
        return new Response("", { status: 304 });
      }
    }
  }

  if (new URL(request.url).pathname === "/rss/posts.xml") {
    return new Response(await postsRss(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }

  const pathname = new URL(request.url).pathname;
  const API_PREFIX = `/earthstar-api/v1/${process.env.GARDEN_WORKSPACE}`;

  if (pathname.startsWith(API_PREFIX)) {
    const storage = getGardenStorage();

    if (!storage) {
      return new Response(undefined, {
        status: 404,
      });
    }

    // list paths
    // /earthstar-api/v1/:workspace/paths
    if (pathname === `${API_PREFIX}/paths` && request.method === "GET") {
      const paths = storage.paths();

      storage.close();

      return json(paths, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // get all documents
    // /earthstar-api/v1/:workspace/documents
    if (pathname === `${API_PREFIX}/documents` && request.method === "GET") {
      const docs = storage.documents({ history: "all" });

      storage.close();

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
      storage.close();

      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ingest documents (uploaded from client)
    // /earthstar-api/v1/:workspace/documents
    if (pathname === `${API_PREFIX}/documents` && request.method === "POST") {
      const docs: Document[] = await request.json();

      if (!Array.isArray(docs)) {
        return new Response(undefined, { status: 404 });
      }

      let numIngested = 0;
      for (let doc of docs) {
        // Only sync docs from gwil
        if (doc.author !== ES_AUTHOR_ADDRESS) {
          return;
        }

        if (storage.ingestDocument(doc, "🙂") === WriteResult.Accepted) {
          numIngested += 1;
        }
      }

      storage.close();

      return json(
        {
          numIngested: numIngested,
          numIgnored: docs.length - numIngested,
          numTotal: docs.length,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Don't do live streaming.
  }

  let markup = ReactDOMServer.renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
    },
  });
}
