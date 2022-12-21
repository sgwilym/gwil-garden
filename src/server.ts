import * as Earthstar from "earthstar";
import { ExtensionGardenAssets } from "./garden_extensions/assets.tsx";
import { ExtensionGardenBlogPost } from "./garden_extensions/blog_posts/extension.tsx";
import { ExtensionGardenShare } from "./garden_extensions/garden_share.ts";
import { ExtensionGardenIndex } from "./garden_extensions/index/extension.tsx";
import { ExtensionGardenRSS } from "./garden_extensions/rss.tsx";

new Earthstar.Server([
  new ExtensionGardenShare(),
  new ExtensionGardenRSS(),
  new ExtensionGardenAssets(),
  new ExtensionGardenIndex(),
  new ExtensionGardenBlogPost(),
  // TODO: Microblog extension.
  // TODO: ActivityPub extension.
  new Earthstar.ExtensionSyncWeb({ path: "/sync" }),
], {
  port: 8080,
});
