import { StorageSqlite, ValidatorEs4 } from "earthstar";
import dotenv from "dotenv";

export function getGardenStorage() {
  dotenv.config();

  if (!process.env.GARDEN_WORKSPACE) {
    return undefined;
  }

  return new StorageSqlite({
    workspace: process.env.GARDEN_WORKSPACE,
    filename: "./data/gwilgarden.sql",
    mode: "create-or-open",
    validators: [ValidatorEs4],
  });
}
