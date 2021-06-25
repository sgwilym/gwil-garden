import { Document } from "earthstar";
import { bundleMDX } from "mdx-bundler";
import { getGardenStorage } from "./storage.server";
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

const importFromEarthstarPlugin: Plugin = {
  name: "earthstar",
  setup(build) {
    build.onResolve({ filter: /.*\/components\/.*/ }, (args) => ({
      path: args.path,
      namespace: "earthstar",
    }));
    build.onLoad({ filter: /.*/, namespace: "earthstar" }, (args) => {
      const { path } = args;

      const storage = getGardenStorage();

      if (!storage) {
        return args;
      }

      const filename = path.replace("./components/", "");

      const maybeComponent = storage.getContent(
        `/garden/posts/components/${filename}`
      );

      if (maybeComponent) {
        return { contents: maybeComponent, loader: "tsx" };
      }

      return {};
    });
  },
};

async function docToPost(doc: Document): Promise<Post> {
  const result = await bundleMDX(doc.content, {
    esbuildOptions(options) {
      const plugins = options.plugins || [];

      // console.log({plugins})

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

export function getPost(slug: string): Promise<Post | undefined> {
  const storage = getGardenStorage();

  if (!storage) {
    return Promise.resolve(undefined);
  }

  const doc = storage.getDocument(`/garden/posts/${slug}.md`);

  if (!doc) {
    const mdxDoc = storage.getDocument(`/garden/posts/${slug}.mdx`);

    if (!mdxDoc) {
      return Promise.resolve(undefined);
    }

    return docToPost(mdxDoc);
  }

  return docToPost(doc);
}

export function getPosts(): Promise<Post[]> {
  const storage = getGardenStorage();

  if (!storage) {
    return Promise.resolve([]);
  }

  const docs = storage.documents({
    pathStartsWith: "/garden/posts/",
    pathEndsWith: '.md',
    author: ES_AUTHOR_ADDRESS,
    contentLengthGt: 0,
  });
  
  const mdxDocs = storage.documents({
    pathStartsWith: "/garden/posts/",
    pathEndsWith: '.mdx',
    author: ES_AUTHOR_ADDRESS,
    contentLengthGt: 0,
  })

  storage.close();

  return Promise.all([...docs, ...mdxDocs].map(docToPost));
}
