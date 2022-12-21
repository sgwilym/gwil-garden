import * as Earthstar from "earthstar";
import { join } from "https://deno.land/std@0.154.0/path/mod.ts";
import { contentType } from "https://deno.land/std@0.167.0/media_types/mod.ts";
import { extname } from "https://deno.land/std@0.154.0/path/mod.ts";

export class ExtensionGardenAssets implements Earthstar.IServerExtension {
  register(): Promise<void> {
    return Promise.resolve();
  }

  async handler(req: Request): Promise<Response | null> {
    // Check if matches asset path
    try {
      const pattern = new URLPattern({ pathname: "/*" });

      const match = pattern.exec(req.url);

      if (!match || match.pathname.groups[0] === "") {
        return Promise.resolve(null);
      }

      const pathToGet = match.pathname.groups[0];

      const file = await Deno.open(join("./public", pathToGet));

      const extension = extname(pathToGet);

      const res = new Response(
        file.readable,
        {
          headers: {
            "status": "200",
            "content-type": contentType(extension) || "text/plain",
          },
        },
      );

      return Promise.resolve(res);
    } catch {
      // Couldn't open any file there.
      return Promise.resolve(null);
    }
  }
}
