import { format } from "date-fns";
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

function borderClassname(i: number, arr: Array<any>): string {
  if (arr.length > 1 && (i === 0 || i < arr.length - 1)) {
    return "border-b border-gray-100 pb-3";
  }

  return "";
}

export default function Index() {
  let data = useRouteData<PostLoaderType>();

  return (
    <ul className={"max-w-prose m-auto p-4 space-y-3"}>
      {data.posts.map((post, i, arr) => (
        <li className={`${borderClassname(i, arr)}`}>
          <a className={"group"} href={`/posts/${post.slug}`}>
            <h1
              className={
                "text-xl group-hover:text-green-600 font-semibold transition"
              }
            >
              {post.title}
            </h1>
            <p className={"text-sm text-gray-400"}>{`${format(
              new Date(post.published),
              "PPP"
            )}`}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}
