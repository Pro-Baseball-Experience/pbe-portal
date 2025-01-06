import { UseToastOptions } from "@chakra-ui/react";

const defaultToastOptions: Partial<UseToastOptions> = {
  duration: 2500,
  isClosable: true,
  position: "bottom-left",
};

export const successToastOptions: Partial<UseToastOptions> = {
  status: "success",
  ...defaultToastOptions,
};

export const warningToastOptions: Partial<UseToastOptions> = {
  status: "warning",
  ...defaultToastOptions,
};

export const errorToastOptions: Partial<UseToastOptions> = {
  status: "error",
  ...defaultToastOptions,
};
