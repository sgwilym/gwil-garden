import * as Earthstar from "earthstar";
import { GWIL_AUTHOR_ADDR } from "../constants.ts";

export type BlogPost = {
  title: string;
  published: Date;
  modified: Date;
  markdown: string;
  slug: string;
  markdownHash: string;
  description: string;
  esDoc: Earthstar.DocEs5;
};

export type BlogPostMetadata = Omit<BlogPost, "markdown">;

// posts/{YEAR}/{MONTH}/{DAY}/{SLUG}.md
// title, description in JSON text.
// markdown is in attachment.

Earthstar.queryByTemplate;

const blogPostPathTemplate =
  `/blog/1.0/~${GWIL_AUTHOR_ADDR}/{yyyy}/{mm}/{dd}/{slug}/post.md`;

const blogPostAssetPathTemplate =
  `/blog/1.0/~${GWIL_AUTHOR_ADDR}/{yyyy}/{mm}/{dd}/{slug}/assets/{name}`;

function getBlogPostMetadata(
  doc: Earthstar.DocEs5,
): BlogPostMetadata | Earthstar.ValidationError {
  if (!doc.attachmentHash) {
    return new Earthstar.ValidationError("Not a valid blog post.");
  }

  const variables = Earthstar.extractTemplateVariablesFromPath(
    blogPostPathTemplate,
    doc.path,
  );

  if (!variables) {
    return new Earthstar.ValidationError("Not a valid blog post.");
  }

  const { title, description } = JSON.parse(doc.text);

  return {
    title,
    description,
    published: new Date(
      `${variables["yyyy"]}-${variables["mm"]}-${variables["dd"]}`,
    ),
    modified: new Date(doc.timestamp / 1000),
    slug: variables["slug"],
    markdownHash: doc.attachmentHash,
    esDoc: doc,
  };
}

export async function getBlogPost(
  replica: Earthstar.Replica,
  doc: Earthstar.DocEs5,
): Promise<BlogPost | Earthstar.ValidationError> {
  const metadata = getBlogPostMetadata(doc);

  const attachment = await replica.getAttachment(doc);

  if (Earthstar.isErr(attachment) || !attachment || Earthstar.isErr(metadata)) {
    return new Earthstar.ValidationError("Not a valid blog post");
  }

  const bytes = await attachment.bytes();

  const markdown = new TextDecoder().decode(bytes);

  return {
    ...metadata,
    markdown,
  };
}

export async function getBlogPostsMetadata(
  replica: Earthstar.Replica,
): Promise<BlogPostMetadata[]> {
  const docs = await Earthstar.queryByTemplate(replica, blogPostPathTemplate);

  const posts = [];

  for (const doc of docs) {
    const attachment = await replica.getAttachment(doc);

    if (Earthstar.isErr(attachment) || !attachment) {
      continue;
    }

    const result = getBlogPostMetadata(doc);

    if (Earthstar.isErr(result)) {
      continue;
    }

    posts.push(result);
  }

  posts.sort((a, b) => {
    if (a.published > b.published) {
      return -1;
    } else if (a.published < b.published) {
      return 1;
    }

    return 0;
  });

  return posts;
}

// TODO: Make a thing which maintains indexes of posts instead of creating all of the posts every time.
