import { promises } from "dns";
import { networkInterfaces } from "os";

export async function getInstanceURLs(): Promise<Set<string>> {
  const nets = networkInterfaces();

  const internalIpv6s = Object.keys(nets)
    .map((netKey) => {
      const netInterface = nets[netKey];

      return netInterface
        ?.filter((address) => {
          return address.family === "IPv6";
        })
        .map((address) => address.address);
    })
    .flat();

  if (process.env.NODE_ENV !== "production") {
    return new Set();
  }

  const resolver = new promises.Resolver();

  try {
    const ipv6s = await resolver.resolve6(
      `${process.env.FLY_APP_NAME}.internal`
    );

    const transformed = ipv6s
      .filter((ip) => !internalIpv6s.includes(ip))
      .map((ip) => `http://[${ip}]:8080`);
      
    return new Set(transformed)
  } catch {
    return new Set();
  }
}
