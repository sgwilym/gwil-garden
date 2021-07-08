import { json, LoaderFunction, redirect, useRouteData } from "remix";
import { default as MPost } from "../../components/MicroPost";
import { getLobbyPost } from "../../workspace/lobby.server";

export let loader: LoaderFunction = async ({ params }) => {
  const lobbyPost = getLobbyPost(parseInt(params.timestamp));

  if (!lobbyPost) {
    return redirect("/404");
  }

  return json({ lobbyPost });
};

export default function MicroPost() {
  const { lobbyPost } = useRouteData();

  return <MPost lobbyPost={lobbyPost} />;
}
