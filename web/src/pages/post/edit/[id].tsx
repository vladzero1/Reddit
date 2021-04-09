import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const EditPost: React.FC<{}> = ({}) => {
  const intId = useGetIntId();
  const [{ fetching, data, error }] = useGetPostFromUrl();
  const [, updatePost]= useUpdatePostMutation();
  if (fetching) {
    return <Layout>...Loading</Layout>;
  }
  if (error) {
    return <Layout>{error.message}</Layout>;
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find Post!</Box>
      </Layout>
    );
  }
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, content: data.post.content }}
        onSubmit={async (values) => {
          const { error } = await updatePost({
            id: intId,
            input: {...values},
          });
          if (!error) router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" placeholder="Title" />
            <Box mt={4}>
              <InputField
                name="content"
                label="Content"
                placeholder="Content"
                textarea
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              Edit Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
