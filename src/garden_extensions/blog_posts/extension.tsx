import * as Earthstar from "earthstar";
import { getHeaderData } from "../../components/header.tsx";
import { GWIL_AUTHOR_ADDR, GWIL_GARDEN_SHARE } from "../../constants.ts";
import { BlogPost, getBlogPost } from "../../helpers/blog_posts.ts";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogPost as BlogPostComponent } from "../../components/blog_post.tsx";
import { contentType } from "https://deno.land/std@0.167.0/media_types/mod.ts";
import { extname } from "https://deno.land/std@0.154.0/path/mod.ts";

export class ExtensionGardenBlogPost implements Earthstar.IServerExtension {
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

    const blogPostPattern = new URLPattern({
      pathname: "/posts/:slug",
    });

    const match = blogPostPattern.exec(req.url);

    // This request isn't for a blog post...
    if (!match) {
      // but it could still be an asset for a blog post.
      const blogPostAssetPattern = new URLPattern({
        pathname: "/posts/:slug/assets/:assetName",
      });

      const match = blogPostAssetPattern.exec(req.url);

      // It's a blog post asset (e.g. image)
      if (match) {
        const { slug, assetName } = match.pathname.groups;

        const [assetDoc] = await this.gardenReplica?.queryDocs({
          filter: {
            pathStartsWith: `/blog/1.0/~${GWIL_AUTHOR_ADDR}`,
            pathEndsWith: `${slug}/assets/${assetName}`,
          },
        });

        if (!assetDoc) {
          return Promise.resolve(null);
        }

        // Check for Etag...
        const assetEtag = req.headers.get("If-None-Match");

        if (`W/${assetDoc.attachmentHash}` === assetEtag) {
          return new Response(undefined, { status: 304 });
        }

        const attachment = await this.gardenReplica?.getAttachment(assetDoc);

        if (Earthstar.isErr(attachment) || !attachment) {
          return Promise.resolve(null);
        }

        const extension = extname(assetDoc.path);

        const res = new Response(
          await attachment.stream(),
          {
            headers: {
              "status": "200",
              "content-type": contentType(extension) || "text/plain",
              "Etag": `W/${assetDoc.attachmentHash}`,
            },
          },
        );

        return res;
      }

      return Promise.resolve(null);
    }

    const { slug } = match.pathname.groups;

    // TODO: check cache for response!

    // In Gwil's garden, slugs are IDs, so we will just get the first one.
    const [blogDoc] = await this.gardenReplica?.queryDocs({
      filter: {
        pathStartsWith: `/blog/1.0/~${GWIL_AUTHOR_ADDR}`,
        pathEndsWith: `${slug}/post.md`,
      },
    });

    if (!blogDoc) {
      return Promise.resolve(null);
    }

    const postEtag = req.headers.get("If-None-Match");

    if (`W/${blogDoc.attachmentHash}` === postEtag) {
      return new Response(undefined, { status: 304 });
    }

    const blogPost = await getBlogPost(this.gardenReplica, blogDoc);

    if (Earthstar.isErr(blogPost)) {
      return Promise.resolve(null);
    }

    const res = new Response(
      await getBlogPostBody(this.gardenReplica, blogPost),
      {
        headers: {
          "content-type": "text/html",
          "Etag": `W/${blogDoc.attachmentHash}`,
        },
      },
    );

    return res;
  }
}

async function getBlogPostBody(replica: Earthstar.Replica, post: BlogPost) {
  const blogPostProps = {
    headerProps: await getHeaderData(replica),
    blogPost: post,
  };

  return renderToStaticMarkup(
    <BlogPostComponent {...blogPostProps} />,
  );
}
