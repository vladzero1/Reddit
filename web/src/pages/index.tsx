import { withUrqlClient } from "next-urql";
import Link from "next/link";
import { Layout } from "../components/Layout";
import { usePostQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/react";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: undefined as undefined | string,
  });

  const [{ data, fetching }] = usePostQuery({
    variables,
  });
  if (!data && !fetching) {
    return <div>data is null</div>;
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
            data!.posts.posts.map((post) => (
              <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                flex="1"
                borderRadius="md"
                key={post.id}
              >
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.contentSnippets}</Text>
              </Box>
            ))
          )}
        </Stack>
        {data?.posts.hasMore ? (
          <Flex>
            <Button
              m="auto"
              colorScheme="teal"
              shadow="md"
              borderWidth="1px"
              mt={8}
              isLoading={fetching}
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data?.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
            >
              Load More
            </Button>
          </Flex>
        ) : null}
      </Layout>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
