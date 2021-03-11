import { Box, Link } from '@chakra-ui/layout';
import { Flex } from '@chakra-ui/react';
import React from 'react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

interface NavbarProps {

}

export const Navbar: React.FC<NavbarProps> = ({ }) => {
  const [{ data, fetching }] = useMeQuery();
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
    console.log(data.me.username)
    body = (
      <>
        <Flex>
          <Box mr={2}>{data.me.username}</Box>|
          <Link
            href="/"
            ml={2}
            onClick={
              () => {
                logout();
              }
            }
            isLoading={fetchingLogout}
          >
            Logout
          </Link>
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