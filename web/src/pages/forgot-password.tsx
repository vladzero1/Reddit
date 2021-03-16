import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

const forgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "" }}
        onSubmit={async (values) => {
          await forgotPassword({ username: values.username });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>Email Sent!</Box>
          ) : (
            <Form>
              <InputField
                name="username"
                label="Username"
                placeholder="Username"
              />
              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                Reset Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(forgotPassword);
