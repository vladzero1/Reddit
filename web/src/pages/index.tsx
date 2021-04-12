import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Link from "next/link";
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 5,
    cursor: undefined as undefined | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  if (!data && !fetching) {
    return <div>data is null</div>;
  }
  return (
    <Layout variant="regular">
      <Stack spacing="24px">
        {fetching && !data ? (
          <div>...loading</div>
        ) : (
          data!.posts.posts.map((post) => {
            return !post ? null : (
              <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                flex="1"
                borderRadius="md"
                key={post.id}
              >
                <Flex>
                  <UpdootSection post={post} />
                  <Box>
                    <Link href="/post/[id]" as={`/post/${post.id}`}>
                      <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                    <Text>Posted by {post.creator.username}</Text>
                    <Text mt={4}>{post.contentSnippets}</Text>
                  </Box>
                  <EditDeletePostButtons
                    id={post.id}
                    creatorId={post.creator.id}
                  />
                </Flex>
              </Box>
            );
          })
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
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
