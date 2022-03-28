import { Doc } from "earthstar";
import { bundleMDX } from "mdx-bundler";
import { getGardenReplica } from "./storage.server";
import { ES_AUTHOR_ADDRESS } from "../constants";
import { Plugin } from "esbuild";

export type Post = {
  title: string;
  published: Date;
  code: string;
  slug: string;
  description: string;
  contentHash: string;
};

export function isPost(value: any): value is Post {
  if ("contentHash" in value) {
    return true;
  }

  return false;
}

const importFromEarthstarPlugin: Plugin = {
  name: "earthstar",
  setup(build) {
    const replica = getGardenReplica();
    build.onResolve({ filter: /.*\/components\/.*/ }, (args) => ({
      path: args.path,
      namespace: "earthstar",
    }));
    build.onLoad({ filter: /.*/, namespace: "earthstar" }, async (args) => {
      const { path } = args;

      if (!replica) {
        return args;
      }

      const filename = path.replace("./components/", "");

      const maybeComponentDoc = await replica.getLatestDocAtPath(
        `/garden/posts/components/${filename}`,
      );

      if (maybeComponentDoc) {
        return { contents: maybeComponentDoc.content, loader: "tsx" };
      }

      return {};
    });
  },
};

async function docToPost(doc: Doc): Promise<Post> {
  const result = await bundleMDX(doc.content, {
    esbuildOptions(options) {
      const plugins = options.plugins || [];

      options.plugins = [importFromEarthstarPlugin, ...plugins];

      return options;
    },
  });

  const slug = doc.path.replace("/garden/posts/", "").replace(/\.mdx?/, "");

  return {
    title: result.frontmatter.title,
    description: result.frontmatter.description,
    published: new Date(result.frontmatter.published),
    code: result.code,
    slug,
    contentHash: doc.contentHash,
  };
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const replica = getGardenReplica();

  if (!replica) {
    return Promise.resolve(undefined);
  }

  const doc = await replica.getLatestDocAtPath(`/garden/posts/${slug}.md`);

  if (!doc) {
    const mdxDoc = await replica.getLatestDocAtPath(`/garden/posts/${slug}.mdx`);

    if (!mdxDoc) {
      return Promise.resolve(undefined);
    }

    return docToPost(mdxDoc);
  }

  return docToPost(doc);
}

export async function getPosts(): Promise<Post[]> {
  const replica = getGardenReplica();

  if (!replica) {
    return Promise.resolve([]);
  }

  const docs = await replica.queryDocs({
    filter: {
      pathStartsWith: "/garden/posts/",
      pathEndsWith: ".md",
      author: ES_AUTHOR_ADDRESS,
      contentLengthGt: 0,
    }
  });

  const mdxDocs = await replica.queryDocs({
    filter: {
      pathStartsWith: "/garden/posts/",
      pathEndsWith: ".mdx",
      author: ES_AUTHOR_ADDRESS,
      contentLengthGt: 0,
    }
  });

  return Promise.all([...docs, ...mdxDocs].map(docToPost));
}
