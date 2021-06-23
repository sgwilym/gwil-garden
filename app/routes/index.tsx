import { format } from "date-fns";
import { MetaFunction, LinksFunction, LoaderFunction, json } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";
import { getPosts, Post } from "../workspace/posts.server";

export let meta: MetaFunction = () => {
  return {
    title: "Gwil's garden",
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

function borderClassname(i: number, arr: Array<any>): string {
  if (arr.length > 1 && (i === 0 || i < arr.length - 1)) {
    return "border-b border-gray-100 pb-3";
  }

  return "";
}

type PostLoaderType = { posts: Post[] };

export let loader: LoaderFunction = async () => {
  // load all the blog posts from workspace.
  const posts = await getPosts();

  return json(
    { posts },
    {
      headers: {
        "Cache-Control": "max-age=300",
      },
    }
  );
};

export default function Index() {
  let data = useRouteData<PostLoaderType>();

  return (
    <ul className={"max-w-prose m-auto my-4 space-y-4"}>
      {data.posts.map((post, i, arr) => (
        <li className={`${borderClassname(i, arr)}`}>
          <a className={"group"} href={`/posts/${post.slug}`}>
            <h1
              className={
                "font-display text-3xl group-hover:text-yellow-400 transition"
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
