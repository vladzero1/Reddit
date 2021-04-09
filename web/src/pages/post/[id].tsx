import { Box, Heading } from '@chakra-ui/layout';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';


export const Post: React.FC<{}> = ({}) => {
  const [{fetching, data, error}] = useGetPostFromUrl();
  if(fetching){
    return <Layout>...Loading</Layout>
  }
  if(error){
    return <Layout>{error.message}</Layout>;
  }
  if(!data?.post){
    return (
      <Layout>
        <Box>Could not find Post!</Box>
      </Layout>
    );
  }
    return (
      <Layout>
        <Box mb={4}>
          <Heading fontSize="xl">{data?.post?.title}</Heading>

          {data?.post?.content}
        </Box>

        <EditDeletePostButtons
          creatorId={data.post.creator.id}
          id={data.post.id}
        />
      </Layout>
    );
}

export default withUrqlClient(createUrqlClient,{ssr: true})(Post);