import * as Earthstar from "earthstar";
import { renderToStaticMarkup } from "react-dom/server";
import rss from "rss";
import {
  BlogPostMetadata,
  getBlogPost,
  getBlogPostsMetadata,
} from "../helpers/blog_posts.ts";
import ReactMarkdown from "react-markdown";
import { GWIL_GARDEN_SHARE } from "../constants.ts";

async function getFeedFingerprintAndMetadata(replica: Earthstar.Replica) {
  const postsMetadata = await getBlogPostsMetadata(replica);

  const fingerprint = postsMetadata.map((metadata) => metadata.markdownHash)
    .join("_");

  return { postsMetadata, fingerprint };
}

export async function postsRss(
  replica: Earthstar.Replica,
  metadata: BlogPostMetadata[],
) {
  const feed = new rss({
    title: "Gwil's garden - Posts",
    site_url: "https://gwil.garden",
    feed_url: "https://gwil.garden/rss/posts.xml",
    webMaster: "Sam Gwilym <sam@gwil.garden>",
    image_url: "https://gwil.garden/images/favicon-196.png",
  });

  for (const post of metadata) {
    const withContent = await getBlogPost(replica, post.esDoc);

    if (Earthstar.isErr(withContent)) {
      continue;
    }

    feed.item({
      title: post.title,
      author: "Sam Gwilym",
      description: renderToStaticMarkup(
        <ReactMarkdown>{withContent.markdown}</ReactMarkdown>,
      ),
      url: `https://gwil.garden/posts/${post.slug}`,
      date: post.published,
      guid: post.slug,
    });
  }

  return feed.xml();
}

export class ExtensionGardenRSS implements Earthstar.IServerExtension {
  private gardenReplica: Earthstar.Replica | null = null;

  register(peer: Earthstar.Peer): Promise<void> {
    const replica = peer.getReplica(GWIL_GARDEN_SHARE);

    if (!replica) {
      throw "+gwilgarden replica not found on peer!";
    }

    this.gardenReplica = replica;

    return Promise.resolve();
  }

  async handler(req: Request): Promise<Response | null> {
    if (!this.gardenReplica) {
      return Promise.resolve(null);
    }

    const rssPattern = new URLPattern({
      pathname: "/rss/:feed",
    });

    const match = rssPattern.exec(req.url);

    if (match) {
      const { feed } = match.pathname.groups;

      if (feed === "posts.xml") {
        const CACHE = await caches.open("v1");

        const { fingerprint, postsMetadata } =
          await getFeedFingerprintAndMetadata(this.gardenReplica);

        const cacheMatch = await CACHE.match(`${req.url}#${fingerprint}`);

        if (cacheMatch) {
          return cacheMatch;
        }

        const response = new Response(
          await postsRss(this.gardenReplica, postsMetadata),
          {
            headers: {
              "Content-Type": "application/xml",
            },
          },
        );

        await CACHE.put(`${req.url}#${fingerprint}`, response.clone());

        return response;
      }
    }

    return Promise.resolve(null);
  }
}
