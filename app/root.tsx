import type { LinksFunction, LoaderFunction } from "remix";
import { Meta, Links, Scripts, useRouteData, LiveReload } from "remix";
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

  const status = storage?.getContent(`/about/~${ES_AUTHOR_ADDRESS}/status.txt`);

  return { date: new Date(), status };
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
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
      <header className={"my-4 p-3 bg-gray-50 rounded-lg max-w-prose m-auto"}>
        <h1
          className={"text-green-600 hover:text-green-800 transition text-xl "}
        >
          <a href="/">gwil's garden 🌱</a>
        </h1>
        <p className={"text-sm text-gray-400"}>{data.status}</p>
      </header>
      <Outlet />
      <footer className={"text-gray-300 p-4 max-w-prose m-auto"}>
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
