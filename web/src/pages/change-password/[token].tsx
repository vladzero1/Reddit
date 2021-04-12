import { Box, Button, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import Link from "next/link";

const ChangePassword: NextPage<{}> = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token: router.query.token === "String" ? router.query.token : "",
          });
          if (response.data?.changePassword.errors) {
            const errMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errMap) {
              setTokenError(errMap.token);
            }
            setErrors(errMap);
          } else {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name="newPassword"
                label="New Password"
                placeholder="New Password"
                type="password"
              />
            </Box>
            {tokenError ? (
              <Flex>
                <Box mr={2} color="red.200">
                  {tokenError}
                </Box>
                <Link href="/forgotPassword">go to forgot password menu</Link>
              </Flex>
            ) : null}
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
