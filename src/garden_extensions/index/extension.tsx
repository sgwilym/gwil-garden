import { IServerExtension, Peer, Replica } from "earthstar";
import { getHeaderData } from "../../components/header.tsx";
import { renderToStaticMarkup } from "react-dom/server";
import { Index } from "../../components/index.tsx";
import { GWIL_GARDEN_SHARE } from "../../constants.ts";
import {
  getBlogPostsMetadata,
} from "../../helpers/blog_posts.ts";

export class ExtensionGardenIndex implements IServerExtension {
  private gardenReplica: Replica | null = null;

  register(peer: Peer): Promise<void> {
    const replica = peer.getReplica(GWIL_GARDEN_SHARE);

    if (!replica) {
      throw "+gwilgarden replica not found on peer!";
    }

    this.gardenReplica = replica;

    return Promise.resolve();
  }

  async handler(req: Request): Promise<Response | null> {
    if (!this.gardenReplica) {
      return new Response("Sorry, problems on our side...", {
        status: 500,
      });
    }

    // pattern match the main page.
    const indexPattern = new URLPattern({
      pathname: "/",
    });

    if (indexPattern.test(req.url)) {
      // Construct static HTML response with React.

      return new Response(
        await getIndexBody(this.gardenReplica),
        {
          headers: {
            "content-type": "text/html",
          },
        },
      );
    }

    return Promise.resolve(null);
  }
}

async function getIndexBody(replica: Replica) {
  const indexData = {
    headerProps: getHeaderData(replica),
    blogPosts: await getBlogPostsMetadata(replica),
  };

  return renderToStaticMarkup(
    <Index {...indexData} />,
  );
}
