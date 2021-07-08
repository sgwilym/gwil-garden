import ReactDOMServer from "react-dom/server";
import { getMDXComponent } from "mdx-bundler/client";
import nodeRss from "rss";
import { getPosts } from "./workspace/posts.server";
import {
  getLobbyDocPublishedTimestamp,
  getLobbyPosts,
} from "./workspace/lobby.server";

export async function postsRss() {
  const feed = new nodeRss({
    title: "Gwil's garden - Posts",
    site_url: "https://gwil.garden",
    feed_url: "https://gwil.garden/rss/posts.xml",
    webMaster: "Sam Gwilym <gwilym@me.com>",
    image_url: "https://gwil.garden/images/favicon-196.png",
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

export async function lobbyRss() {
  const feed = new nodeRss({
    title: "Gwil's garden - Microposts",
    site_url: "https://gwil.garden",
    feed_url: "https://gwil.garden/rss/microposts.xml",
    webMaster: "Sam Gwilym <gwilym@me.com>",
    image_url: "https://gwil.garden/images/favicon-196.png",
  });

  const posts = getLobbyPosts();

  posts.forEach((post) => {
    feed.item({
      title: "",
      author: "Sam Gwilym",
      description: post.content,
      url: `https://gwil.garden/micro/${post.timestamp}`,
      date: post.published,
      guid: `${post.timestamp}`,
    });
  });

  return feed.xml();
}
