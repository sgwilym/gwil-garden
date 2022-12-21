import { BlogPostMetadata } from "../helpers/blog_posts.ts";
import { HeaderProps } from "./header.tsx";
import { Layout } from "./layout.tsx";

type IndexProps = {
  headerProps: HeaderProps;
  blogPosts: BlogPostMetadata[];
};

function BlogPostSummary({ metadata }: { metadata: BlogPostMetadata }) {
  return (
    <li className="border-b border-gray-100 pb-3">
      <a className={"group"} href={`/posts/${metadata.slug}`}>
        <h1
          className={"font-display text-3xl group-hover:text-yellow-400 transition"}
        >
          {metadata.title}
        </h1>
        <p className={"text-sm text-gray-400"}>
          {`${
            new Intl.DateTimeFormat("en-EN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(metadata.published)
          }`}
        </p>
      </a>
    </li>
  );
}

export function Index(props: IndexProps) {
  return (
    <Layout headerProps={props.headerProps} title="Gwilʼs garden">
      <main className="max-w-prose m-auto my-6">
        {props.blogPosts.length === 0 ? <p>Nothing to see here!</p> : null}

        <ol className={"max-w-prose m-auto my-4 space-y-4"}>
          {props.blogPosts.map((post) => {
            return <BlogPostSummary metadata={post} key={post.markdownHash} />;
          })}
        </ol>
      </main>
    </Layout>
  );
}
