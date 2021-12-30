import { StorageSqlite, ValidatorEs4 } from "earthstar";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import path from 'path';

var storageSingleton: StorageSqlite | undefined = undefined;
dotenv.config();

export function getGardenStorage() {
  if (!process.env.GARDEN_WORKSPACE) {
    return undefined;
  }

  const dataDir = path.resolve(process.env.NODE_ENV !== "production" ? "data-dev" : "/data");

  if (!fs.existsSync(dataDir)) {
    console.log(`${dataDir} not found, creating...`)
    fs.mkdirSync(dataDir);
  }
  
  if (!storageSingleton) {
    console.log("No storage yet, instantiating...");

    storageSingleton = new StorageSqlite({
      workspace: process.env.GARDEN_WORKSPACE,
      filename: `${dataDir}/gwilgarden.sql`,
      mode: "create-or-open",
      validators: [ValidatorEs4],
    });
  }

  return storageSingleton;
}

export function getStorageHash(): string {
  const storage = getGardenStorage();

  if (!storage) {
    return "";
  }

  const docs = storage.documents();

  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(docs))
    .digest("hex");

  return hash;
}
