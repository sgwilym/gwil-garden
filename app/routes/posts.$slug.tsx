import * as React from "react";
import { useRouteData } from "remix/client";
import { LoaderFunction, redirect } from "remix/server";
import { getPost, Post } from "../workspace/posts.server";
import { getMDXComponent } from "mdx-bundler/client";
import { format } from "date-fns";

export let loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.slug);

  if (!post) {
    return redirect("/404");
  }

  return { post };
};

type LoaderType = {
  post: Post;
};

function Link(props: {}) {
  return <a className={"underline text-green-600"} {...props} />;
}

export default function Post() {
  const { post } = useRouteData<LoaderType>();

  const Component = React.useMemo(
    () => getMDXComponent(post.code),
    [post.code]
  );

  return (
    <article className={"p-4 space-y-3 max-w-prose m-auto"}>
      <header>
        <h1 className={"text-xl font-semibold"}>{post.title}</h1>
        <p className={"text-sm text-gray-400"}>{`${format(
          new Date(post.published),
          "PPP"
        )}`}</p>
      </header>

      <Component components={{ a: Link }} />
    </article>
  );
}
