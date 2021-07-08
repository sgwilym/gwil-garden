import { json, LoaderFunction, redirect, useRouteData } from "remix";
import MicroPost from "../../components/MicroPost";
import { getLobbyPosts, LobbyPost } from "../../workspace/lobby.server";

export let loader: LoaderFunction = async () => {
  const microPosts = getLobbyPosts();

  if (!microPosts) {
    return redirect("/404");
  }

  return json({ microPosts });
};

function borderClassname(i: number, arr: Array<any>): string {
  if (arr.length > 1 && (i === 0 || i < arr.length - 1)) {
    return "border-b border-gray-100 pb-3";
  }

  return "";
}

export default function MicroPosts() {
  const { microPosts } = useRouteData<{ microPosts: LobbyPost[] }>();

  return (
    <ol className={"max-w-prose m-auto my-4 space-y-4"}>
      {microPosts.map((post, i, arr) => {
        return (
          <MicroPost className={borderClassname(i, arr)} lobbyPost={post} />
        );
      })}
    </ol>
  );
}
