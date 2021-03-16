import { withUrqlClient } from "next-urql";
import Link from "next/link";
import { Layout } from "../components/layout";
import { usePostQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostQuery();
  return (
    <>
      <Layout>
        <Link href="/create-post">Create Post</Link>
        {!data
          ? null
          : data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
      </Layout>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
