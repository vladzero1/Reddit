import { Box, Link } from '@chakra-ui/layout';
import { Button, Flex } from '@chakra-ui/react';
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
        <Link href="/login" mr={2}>Login</Link>|
        <Link href="/register" ml={2}>Register</Link>
      </>
    )
  } else {
    body = (
      <>
        <Flex>
          <Box mr={2}>{data.me.username}</Box>|
          <Button
            ml={2}
            onClick={
              () => {
                logout();
                router.push(router.pathname);
              }
            }
            size="xs"
            isLoading={fetchingLogout}
          >
            Logout
          </Button>
        </Flex>
      </>
    )
  }
  return (
    <Flex bg='lightsalmon' p={2}>
      <Box ml={'auto'} >
        {body}
      </Box>
    </Flex>

  );
}