import { extendTheme } from "@chakra-ui/react";

const config = {
  initalColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });
export default theme;
