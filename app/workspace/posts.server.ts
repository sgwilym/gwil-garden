import { Document } from "earthstar";
import { bundleMDX } from "mdx-bundler";
import { getGardenStorage } from "./storage.server";
import { ES_AUTHOR_ADDRESS } from '../constants'

export type Post = {
  title: string;
  published: Date;
  code: string;
  slug: string
};

async function docToPost(doc: Document): Promise<Post> {
  const result = await bundleMDX(doc.content);
  
  const slug = doc.path.replace('/garden/posts/', '').replace(/\.mdx?/, '')

  return {
    title: result.frontmatter.title,
    published: new Date(result.frontmatter.published),
    code: result.code,
    slug
  };
}

export function getPost(slug: string): Promise<Post | undefined> {
  const storage = getGardenStorage();

  if (!storage) {
    return Promise.resolve(undefined);
  }

  const doc = storage.getDocument(`/garden/posts/${slug}.md`);

  if (!doc) {
    return Promise.resolve(undefined);
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
    pathEndsWith: ".md",
    author: ES_AUTHOR_ADDRESS,
    contentLengthGt: 0
  });

  storage.close();

  return Promise.all(docs.map(docToPost));
}
