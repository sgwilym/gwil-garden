import { Footer } from "./footer.tsx";
import { Header, HeaderProps } from "./header.tsx";

type LayoutProps = {
  headerProps: HeaderProps;
  children: React.ReactNode;
  title: string;
};

export function Layout(props: LayoutProps) {
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
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed for *micro* posts from Gwil's Garden"
          href="/rss/microposts.xml"
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
        <link rel="stylesheet" href="/style.css" />
        <link rel="me" href="https://post.lurk.org/@gwil" />
        <title>{props.title}</title>
      </head>
      <body>
        <Header {...props.headerProps} />
        {props.children}

        <Footer />
      </body>
    </html>
  );
}
