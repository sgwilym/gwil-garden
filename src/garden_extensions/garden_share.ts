import * as Earthstar from "earthstar";
import { ensureDir } from "https://deno.land/std@0.167.0/fs/ensure_dir.ts";
import { DocDriverSqliteFfi } from "https://deno.land/x/earthstar@v10.0.0-rc.1/src/replica/doc_drivers/sqlite_ffi.ts";

import { GWIL_GARDEN_SHARE } from "../constants.ts";

// Extension to add gwilgarden share.
export class ExtensionGardenShare implements Earthstar.IServerExtension {
  async register(peer: Earthstar.Peer): Promise<void> {
    await ensureDir("./.data");

    const replica = new Earthstar.Replica({
      driver: {
        /*
        docDriver: new DocDriverSqliteFfi({
          share: GWIL_GARDEN_SHARE,
          filename: `./.data/${GWIL_GARDEN_SHARE}.sql`,
          mode: "create-or-open",
        }),
        */
        docDriver: new Earthstar.DocDriverSqlite({
          share: GWIL_GARDEN_SHARE,
          filename: `./.data/${GWIL_GARDEN_SHARE}_not_ffi.sql`,
          mode: "create-or-open",
        }),
        attachmentDriver: new Earthstar.AttachmentDriverFilesystem(
          "./.data/attachments",
        ),
      },
    });

    peer.addReplica(replica);

    return Promise.resolve();
  }

  handler(_req: Request): Promise<Response | null> {
    return Promise.resolve(null);
  }
}
