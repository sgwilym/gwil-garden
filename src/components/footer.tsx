import { ShareLabel } from "react-earthstar";
import { GWIL_GARDEN_SHARE } from "../constants.ts";
import { getHourOf } from "../helpers/seasonal_clock.ts";

export function Footer() {
  return (
    <footer className={"text-gray-300 max-w-prose m-auto py-6"}>
      <p>
        This page was created with data from{" "}
        <a
          className="underline text-blue-500"
          href="https://earthstar-project.org"
        >
          <ShareLabel address={GWIL_GARDEN_SHARE} />
        </a>
      </p>
      <p>
        and was rendered{"  "}
        <a
          className={"underline"}
          href="https://seasonalclock.org/"
        >
          {new Date().getMinutes()} minutes past{"  "}{getHourOf().shortName}
          {" "}
          hour
        </a>
        .
      </p>
    </footer>
  );
}
