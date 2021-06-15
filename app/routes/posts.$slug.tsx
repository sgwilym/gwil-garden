import * as React from "react";
import { useRouteData } from "remix/client";
import { LoaderFunction, redirect } from "remix/server";
import { getPost, Post } from "../workspace/posts.server";
import { getMDXComponent } from "mdx-bundler/client";

export let loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.slug);

  return { post };
};

type LoaderType = {
  post: Post;
};

export default function Post() {
  const { post } = useRouteData<LoaderType>();

  const Component = React.useMemo(
    () => getMDXComponent(post.code),
    [post.code]
  );

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>{post.title}</h1>
      <p>Published on {post.published}</p>
      <Component />
    </div>
  );
}
