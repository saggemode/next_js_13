import '../styles/globals.css'
import { ThemeProvider } from "next-themes";
import { ChakraProvider } from "@chakra-ui/react";
import { NFTProvider } from "../context/NFTContext";
import { NextUIProvider } from "@nextui-org/react";

function MyApp({ Component, pageProps }) {
  return (
    <NFTProvider>
       <ThemeProvider attribute="class">
      <Component {...pageProps} />
      </ThemeProvider>
    </NFTProvider>
  );
}

export default MyApp
