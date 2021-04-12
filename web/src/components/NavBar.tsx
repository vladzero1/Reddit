import { Box, Link } from '@chakra-ui/layout';
import { Button, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

export const NavBar: React.FC<{}> = ({ }) => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: fetchingLogout }, logout] = useLogoutMutation();
  let body = null;

  if (fetching) {

  }

  if (!data?.me) {
    body = (
      <>
        <Link href="/login" mr={2}>
          Login
        </Link>
        |
        <Link href="/register" ml={2}>
          Register
        </Link>
      </>
    );
  } else {
    body = (
      <>
        <Flex align="center">
          <Button as={Link} href="/create-post" mr={2}>
            Create Post
          </Button>
          <Box mr={2}>{data.me.username}</Box>|
          <Button
            ml={2}
            onClick={async () => {
              await logout();
              router.reload();
            }}
            size="xs"
            isLoading={fetchingLogout}
          >
            Logout
          </Button>
        </Flex>
      </>
    );
  }
  return (
    <Flex zIndex={1} bg="burlywood" p={2} align="center">
      <Flex flex={1} align="center" m="auto" maxW={800}>
        <Link href="/">
          <Heading>Reddit-clone</Heading>
        </Link>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
}