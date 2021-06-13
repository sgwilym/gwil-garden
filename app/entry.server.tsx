import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "remix";
import { RemixServer, json } from "remix";
import dotenv from "dotenv";
import { getGardenStorage } from "./workspace/storage.server";
import { Document, WriteResult } from "earthstar";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  dotenv.config();

  // TODO: RSS.
  /*
  if (new URL(request.url).pathname === "/rss.xml") {
    return new Response(await rss(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
  */

  // https://github.com/earthstar-project/earthstar-pub/blob/master/src/pub.ts

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
      return json(storage.paths());
    }

    // get all documents
    // /earthstar-api/v1/:workspace/documents
    if (pathname === `${API_PREFIX}/documents` && request.method === "GET") {
      return json(storage.documents({ history: "all" }));
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
        if (storage.ingestDocument(doc, "🙂") === WriteResult.Accepted) {
          numIngested += 1;
        }
      }

      return json({
        numIngested: numIngested,
        numIgnored: docs.length - numIngested,
        numTotal: docs.length,
      });
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
