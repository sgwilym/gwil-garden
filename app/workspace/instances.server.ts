import { promises } from "dns";

export async function getInstanceURLs(): Promise<string[]> {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  const resolver = new promises.Resolver();

  const ipv6s = await resolver.resolve6(`${process.env.FLY_APP_NAME}.internal`);
  
  return ipv6s.map((ip) => `http://[${ip}]:8080`)
}
