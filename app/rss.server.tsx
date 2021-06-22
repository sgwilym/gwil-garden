import ReactDOMServer from "react-dom/server";
import { getMDXComponent } from "mdx-bundler/client";
import nodeRss from "rss";
import { getPosts } from "./workspace/posts.server";

export async function postsRss() {
  const feed = new nodeRss({
    title: "Gwil's garden",
    site_url: "https://gwil.garden",
    feed_url: "https://gwil.garden/rss/posts.xml",
    webMaster: "Sam Gwilym <gwilym@me.com>",
  });

  const posts = await getPosts();

  posts.forEach((post) => {
    const Component = getMDXComponent(post.code);

    feed.item({
      title: post.title,
      author: "Sam Gwilym",
      description: ReactDOMServer.renderToStaticMarkup(<Component />),
      url: `https://gwil.garden/posts/${post.slug}`,
      date: post.published,
      guid: post.slug,
    });
  });

  return feed.xml();
}
