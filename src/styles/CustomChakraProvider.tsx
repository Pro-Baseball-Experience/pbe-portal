import { Toaster } from "@/components/toast/toaster";
import { ChakraProvider, createSystem, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

const system = createSystem(config);

export const CustomChakraProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => (
  <ChakraProvider value={system}>
    <Toaster />
    {children}
  </ChakraProvider>
);
