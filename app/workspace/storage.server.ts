import { FormatValidatorEs4, Replica } from "earthstar";
import { ReplicaDriverSqlite } from "earthstar/node";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

var replicaSingleton: Replica | undefined = undefined;
dotenv.config();

export function getGardenReplica() {
  if (!process.env.GARDEN_WORKSPACE) {
    return undefined;
  }

  const dataDir = path.resolve(
    process.env.NODE_ENV !== "production" ? "data-dev" : "/data",
  );

  if (!fs.existsSync(dataDir)) {
    console.log(`${dataDir} not found, creating...`);
    fs.mkdirSync(dataDir);
  }

  if (!replicaSingleton) {
    console.log("No storage yet, instantiating...");

    const driver = new ReplicaDriverSqlite({
      filename: `${dataDir}/gwilgarden_stone_soup.sql`,
      mode: "create-or-open",
      share: process.env.GARDEN_WORKSPACE,
    });

    replicaSingleton = new Replica(
      process.env.GARDEN_WORKSPACE,
      FormatValidatorEs4,
      driver,
    );
  }

  return replicaSingleton;
}

export function getStorageHash(): string {
  const storage = getGardenReplica();

  if (!storage) {
    return "";
  }

  const docs = storage.getAllDocs();

  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(docs))
    .digest("hex");

  return hash;
}
