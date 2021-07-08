import { StorageSqlite, ValidatorEs4 } from "earthstar";
import dotenv from "dotenv";
import crypto from 'crypto'

var storageSingleton: StorageSqlite | undefined = undefined;

export function getGardenStorage() {
  dotenv.config();

  if (!process.env.GARDEN_WORKSPACE) {
    return undefined;
  }
  
  const sqlPath = process.env.NODE_ENV !== "production" ? './data-dev/gwilgarden.sql' : '/data/gwilgarden.sql'

  if (!storageSingleton) {
   storageSingleton = new StorageSqlite({
     workspace: process.env.GARDEN_WORKSPACE,
     filename: sqlPath,
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
  
  const hash = crypto.createHash("md5").update(JSON.stringify(docs)).digest('hex')
  
  return hash;
}
