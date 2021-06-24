import * as React from "react";
import {
  useRouteData,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  HeadersFunction,
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
    Etag: `W\\${loaderHeaders.get("Etag")}`,
  };
};

export let loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.slug);

  if (!post) {
    return redirect("/404");
  }

  return json(
    { post },
    {
      headers: {
        Etag: etag(post.contentHash),
      },
    }
  );
};

type LoaderType = {
  post: Post;
};

function Link(props: {}) {
  return <a className={"underline text-blue-600"} {...props} />;
}

export default function Post() {
  const { post } = useRouteData<LoaderType>();

  const Component = React.useMemo(
    () => getMDXComponent(post.code),
    [post.code]
  );

  return (
    <article className={"py-4 space-y-3 max-w-prose m-auto leading-normal"}>
      <header>
        <h1 className={"text-3xl font-display"}>{post.title}</h1>
        <p className={"text-sm text-gray-400"}>{`${format(
          new Date(post.published),
          "PPP"
        )}`}</p>
      </header>

      <Component components={{ a: Link }} />
    </article>
  );
}
