import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./connector";
import React from "react";

const Web3Root = ({ children }: { children: JSX.Element }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>{children}</Web3ReactProvider>
  );
};

export default Web3Root;
