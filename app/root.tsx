import type { LinksFunction, LoaderFunction } from "remix";
import { Meta, Links, useRouteData, LiveReload } from "remix";
import { Outlet } from "react-router-dom";
import * as InternetTime from "dot-beat-time";

import stylesUrl from "./styles/global.css";
import { getGardenStorage } from "./workspace/storage.server";
import { ES_AUTHOR_ADDRESS } from "./constants";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async () => {
  const storage = getGardenStorage();

  const status =
    storage?.getContent(`/about/~${ES_AUTHOR_ADDRESS}/status.txt`) ||
    "Enjoying the morning.";

  return { date: new Date(), status };
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed for posts from Gwil's Garden"
          href="/rss/posts.xml"
        />
        <link
          rel={"icon"}
          href={"/images/favicon-32.png"}
          sizes={`32x32`}
          type="image/png"
        />
        <link
          rel={"icon"}
          href={"/images/favicon-128.png"}
          sizes={`128x128`}
          type="image/png"
        />
        <link
          rel={"icon"}
          href={"/images/favicon-152.png"}
          sizes={`152x152`}
          type="image/png"
        />
        <link
          rel={"icon"}
          href={"/images/favicon-167.png"}
          sizes={`167x167`}
          type="image/png"
        />
        <link
          rel={"icon"}
          href={"/images/favicon-180.png"}
          sizes={`180x180`}
          type="image/png"
        />
        <link
          rel={"icon"}
          href={"/images/favicon-196.png"}
          sizes={`196x196`}
          type="image/png"
        />
        <Meta />
        <Links />
      </head>
      <body className="mx-2">
        {children}
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteData();

  return (
    <Document>
      <header
        className={
          "mt-6 py-4 bg-white max-w-prose m-auto border-b-2 border-gray-50 flex items-center space-x-4"
        }
      >
        <img
          className={"bg-yellow-300 p-3"}
          width={100}
          src={"/images/flower.svg"}
        />
        <div className={"space-y-2"}>
          <h1
            className={"text-black hover:text-yellow-300 transition text-5xl"}
          >
            <a href="/">
              <h1 className={"font-display underline"}>Gwil's garden</h1>
            </a>
          </h1>
          <p className={"text-sm text-gray-800 bg-yellow-300 p-2 inline-block"}>
            {data.status}
          </p>
        </div>
      </header>
      <Outlet />
      <footer className={"text-gray-300 max-w-prose m-auto py-6"}>
        <p>
          This page was rendered at{" "}
          <a className={"underline"} href="http://gwil.co/internet-time/">
            {InternetTime.now()}
          </a>
        </p>
      </footer>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
}
