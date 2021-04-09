import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetsFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetsFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        aria-label="Updoot Post"
        icon={<ChevronUpIcon />}
        isLoading={loadingState === "updoot-loading"}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        onClick={() => {
          setLoadingState("updoot-loading");
          vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
      />
      {post.points}
      <IconButton
        aria-label="Downdoot Post"
        icon={<ChevronDownIcon />}
        isLoading={loadingState === "downdoot-loading"}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        onClick={() => {
          setLoadingState("downdoot-loading");
          vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
      />
    </Flex>
  );
};
