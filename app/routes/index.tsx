import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";
import { getPosts, Post } from "../workspace/posts.server";

export let meta: MetaFunction = () => {
  return {
    title: "gwil's garden",
    description: "Where I put things in the dirt and hope for the best.",
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export function headers() {
  return {
    "Cache-Control":
      "max-age=600, s-maxage=604800, stale-while-revalidate=604800",
  };
}

type PostLoaderType = { posts: Post[] };

export let loader: LoaderFunction = async () => {
  // load all the blog posts from workspace.
  const posts = await getPosts();

  return { posts };
};

export default function Index() {
  let data = useRouteData<PostLoaderType>();

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {data.posts.map((post) => (
        <div>
          <h2>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
        </div>
      ))}
    </div>
  );
}
