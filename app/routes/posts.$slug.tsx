import * as React from "react";
import {
  HeadersFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";

import { getPost, Post } from "../workspace/posts.server";
import { getMDXComponent } from "mdx-bundler/client";
import { format } from "date-fns";
import etag from "../etag.server";

export let meta: MetaFunction = ({ data }) => {
  const { post } = data as LoaderType;

  return {
    title: `${post.title} - Gwil's garden`,
    description: post.description,
  };
};

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    Etag: `W\/${loaderHeaders.get("Etag")}`,
  };
};

export let loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.slug || "");

  if (!post) {
    return redirect("/404");
  }

  const postEtag = etag(post.contentHash);

  return json(
    { post },
    {
      headers: {
        Etag: postEtag,
      },
    },
  );
};

type LoaderType = {
  post: Post;
};

function H2(props: {}) {
  return <h2 {...props} className={"text-2xl font-display mb-5 mt-8"} />;
}

function H3(props: {}) {
  return <h3 {...props} className={"text-xl mt-8"} />;
}

function H4(props: {}) {
  return <h4 {...props} className={"font-bold"} />;
}

function Link(props: {}) {
  return <a className={"underline text-blue-600"} {...props} />;
}

function ListItem(props: {}) {
  return <li className={"list-disc"} {...props} />;
}

function UnorderedList(props: {}) {
  return <ul className={"pl-5 mb-4 leading-7"} {...props} />;
}

function OrderedList(props: {}) {
  return <ul className={"pl-5 mb-4 leading-7"} {...props} />;
}

function Code(props: {}) {
  return <code className={"bg-gray-100 text-sm p-1"} {...props} />;
}

function Paragraph(props: {}) {
  return <p className={"mb-4 leading-7"} {...props} />;
}

function BlockQuote(props: {}) {
  return <blockquote
    className={"mb-4 leading-7 bg-gray-50 pt-4 pb-1 px-4 border-l-4"}
    {...props}
  />;
}

export default function Post() {
  const { post } = useLoaderData<LoaderType>();

  const Component = React.useMemo(
    () => getMDXComponent(post.code),
    [post.code],
  );

  return (
    <article className={"py-4 max-w-prose m-auto"}>
      <header>
        <h1 className={"text-3xl font-display"}>{post.title}</h1>
        <p className={"text-sm text-gray-400"}>
          {`${format(new Date(post.published), "PPP")}`}
        </p>
      </header>

      <Component
        components={{
          p: Paragraph,
          a: Link,
          h2: H2,
          h3: H3,
          h4: H4,
          li: ListItem,
          ul: UnorderedList,
          ol: OrderedList,
          code: Code,
          blockquote: BlockQuote,
        }}
      />
    </article>
  );
}
