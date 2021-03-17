import { withUrqlClient } from "next-urql";
import Link from "next/link";
import { Layout } from "../components/Layout";
import { usePostQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/react";

const Index = () => {
  const [{ data, fetching }] = usePostQuery({
    variables: {
      limit: 10,
    },
  });
  if (!data && !fetching) {
    <div>query failed. please refresh</div>;
  }
  return (
    <>
      <Layout variant="regular">
        <Flex mb={4}>
          <Heading>Reddit-clone</Heading>
          <Box ml="auto">
            <Link href="/create-post">Create Post</Link>
          </Box>
        </Flex>

        <Stack spacing="24px">
          {fetching && !data ? (
            <div>...loading</div>
          ) : (
            data!.posts.map((post) => (
              <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                flex="1"
                borderRadius="md"
              >
                <Heading fontSize="xl" key={post.id}>
                  {post.title}
                </Heading>
                <Text mt={4}>{post.contentSnippets}</Text>
              </Box>
            ))
          )}
        </Stack>
        <Flex>
          <Button
            m="auto"
            colorScheme="teal"
            shadow="md"
            borderWidth="1px"
            mt={8}
          >
            Load More
          </Button>
        </Flex>
      </Layout>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
