import { FormControl, FormLabel, Input, FormErrorMessage, useFieldLabel } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
}

// !!error = true if error exist. example => ('error') = true
export const InputField: React.FC<InputFieldProps> = ({ size:_, ...props}) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name} >{props.label}</FormLabel>
      <Input {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}