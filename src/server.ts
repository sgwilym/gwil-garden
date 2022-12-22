import * as Earthstar from "earthstar";
import { ExtensionGardenAssets } from "./garden_extensions/assets.tsx";
import { ExtensionGardenBlogPost } from "./garden_extensions/blog_posts/extension.tsx";
import { ExtensionGardenShare } from "./garden_extensions/garden_share.ts";
import { ExtensionGardenIndex } from "./garden_extensions/index/extension.tsx";
import { ExtensionGardenRSS } from "./garden_extensions/rss.tsx";

new Earthstar.Server([
  // Sets up a replica for +gwilgarden
  new ExtensionGardenShare(),
  // Serves RSS responses using share data
  new ExtensionGardenRSS(),
  // Serves assets (images, styles...) from the /public folder
  new ExtensionGardenAssets(),
  // Serves HTML for the index page from share date
  new ExtensionGardenIndex(),
  // Serves HTML for blog post pages from share data
  new ExtensionGardenBlogPost(),
  // TODO: Microblog extension.
  // TODO: ActivityPub extension.
  // Sync extension so I can sync new blog posts up from my computer.
  new Earthstar.ExtensionSyncWeb({ path: "/sync" }),
], {
  port: 8080,
});
