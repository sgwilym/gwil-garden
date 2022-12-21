import { HeaderProps } from "./header.tsx";
import { Layout } from "./layout.tsx";
import { BlogPost } from "../helpers/blog_posts.ts";
import ReactMarkdown from "react-markdown";

type BlogPostProps = {
  headerProps: HeaderProps;
  blogPost: BlogPost;
};

export function BlogPost({ blogPost, headerProps }: BlogPostProps) {
  return (
    <Layout
      headerProps={headerProps}
      title={`${blogPost.title} — Gwilʼs garden`}
    >
      <main className="max-w-prose m-auto my-6">
        <header>
          <h1 className={"text-3xl font-display"}>{blogPost.title}</h1>
          <p className={"text-sm text-gray-400"}>
            {`${
              new Intl.DateTimeFormat("en-EN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(blogPost.published)
            }`}
          </p>
        </header>
        <ReactMarkdown
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
        >
          {blogPost.markdown}
        </ReactMarkdown>
      </main>
    </Layout>
  );
}

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
  return (
    <blockquote
      className={"mb-4 leading-7 bg-gray-50 pt-4 pb-1 px-4 border-l-4"}
      {...props}
    />
  );
}
