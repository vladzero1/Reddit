import { Navbar } from "../components/NavBar";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostQuery();
  return (
    <>
      <Navbar />
      { 
        !data ? null : data.posts.map(post => <div key={post.id}>{post.title}</div>)
      }
    </>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
