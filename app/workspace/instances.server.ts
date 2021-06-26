import { promises } from "dns";

export async function getInstanceURLs(): Promise<string[]> {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  const resolver = new promises.Resolver();

  return resolver.resolve6(`${process.env.FLY_APP_NAME}.internal`);
}
