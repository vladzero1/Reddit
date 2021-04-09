import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  if(creatorId !== data?.me?.id){
    return null;
  }
  return (
    <Box ml="auto">
      <Link href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton aria-label="updatePost" icon={<EditIcon />} />
      </Link>
      <IconButton
        aria-label="deletePost"
        icon={<DeleteIcon />}
        bgColor="red.500"
        colorScheme="red"
        onClick={async () => {
          await deletePost({ id });
        }}
      />
    </Box>
  );
};
