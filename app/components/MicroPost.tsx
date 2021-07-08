import { formatDistanceToNow } from "date-fns";
import { LobbyPost } from "../workspace/lobby.server";
import { Link } from "remix";

export default function MicroPost({
  lobbyPost,
  className,
}: {
  lobbyPost: LobbyPost;
  className?: string;
}) {
  return (
    <article className={`${className} max-w-prose m-auto my-4`}>
      <p className={"text-gray-600"}>
        {lobbyPost.content}{" "}
        <Link
          to={`/micro/${lobbyPost.timestamp}`}
          className={"text-sm text-gray-400 ordinal underline"}
        >
          {formatDistanceToNow(new Date(lobbyPost.published), {
            addSuffix: true,
          })}
        </Link>
      </p>
    </article>
  );
}
