import { format } from "date-fns";
import {
  HeadersFunction,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useRouteData,
} from "remix";
import MicroPost from "../components/MicroPost";

import stylesUrl from "../styles/index.css";
import { getStarredLobbyPosts, LobbyPost } from "../workspace/lobby.server";
import { getPosts, isPost, Post } from "../workspace/posts.server";

export let meta: MetaFunction = () => {
  return {
    title: "Gwil's garden",
    description: "Where I put things in the dirt and hope for the best.",
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control") || "",
  };
};

function borderClassname(i: number, arr: Array<any>): string {
  if (arr.length > 1 && (i === 0 || i < arr.length - 1)) {
    return "border-b border-gray-100 pb-3";
  }

  return "";
}

type IndexLoaderType = { posts: Post[]; lobbies: LobbyPost[] };

export let loader: LoaderFunction = async () => {
  // load all the blog posts from workspace.

  const posts = await getPosts();
  const lobbies = getStarredLobbyPosts();

  return json(
    { posts, lobbies },
    {
      headers: {
        "Cache-Control":
          "max-age=600, s-maxage=604800, stale-while-revalidate=604800",
      },
    },
  );
};

function PostLink({ post, className }: { post: Post; className: string }) {
  return (
    <li className={className}>
      <a className={"group"} href={`/posts/${post.slug}`}>
        <h1
          className={"font-display text-3xl group-hover:text-yellow-400 transition"}
        >
          {post.title}
        </h1>
        <p className={"text-sm text-gray-400"}>
          {`${
            format(
              new Date(post.published),
              "PPP",
            )
          }`}
        </p>
      </a>
    </li>
  );
}

export default function Index() {
  let data = useRouteData<IndexLoaderType>();

  const everythingSorted = [...data.posts, ...data.lobbies].sort((a, b) => {
    if (a.published < b.published) {
      return 1;
    }

    if (a.published > b.published) {
      return -1;
    }

    return 0;
  });

  return (
    <ol className={"max-w-prose m-auto my-4 space-y-4"}>
      {everythingSorted.map((thing, i, arr) => {
        const bClassName = borderClassname(i, arr);

        if (!isPost(thing)) {
          return <MicroPost className={bClassName} lobbyPost={thing} />;
        }
        return <PostLink post={thing} className={bClassName} />;
      })}
    </ol>
  );
}
