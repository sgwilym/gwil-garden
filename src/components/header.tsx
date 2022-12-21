import * as Earthstar from "earthstar";
import { GWIL_AUTHOR_ADDR } from "../constants.ts";

export type HeaderProps = {
  status?: string;
};

export async function getHeaderData(
  replica: Earthstar.Replica,
): Promise<HeaderProps> {
  const statusPath = `/about/1.0/~${GWIL_AUTHOR_ADDR}/status`;

  const status = await replica.getLatestDocAtPath(statusPath);

  return { status: status?.text };
}

export function Header({ status }: HeaderProps) {
  return (
    <header
      className={"mt-6 py-4 bg-white max-w-prose m-auto border-b-2 border-gray-50 flex items-center space-x-4"}
    >
      <img
        className={"bg-yellow-300 p-3"}
        width={100}
        src={"/images/flower.svg"}
      />
      <div className={"space-y-2"}>
        <h1
          className={"text-black hover:text-yellow-300 transition text-5xl"}
        >
          <a href="/">
            <h1 className={"font-display underline"}>Gwil's garden</h1>
          </a>
        </h1>
        <p className={"text-sm text-gray-800 bg-yellow-300 p-2 inline-block"}>
          {status || "Keeping myself busy."}
        </p>
      </div>
    </header>
  );
}
