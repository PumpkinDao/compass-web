import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
import { getLibrary } from "./lib";
import { useEagerConnect, useReduxSync } from "./hooks";

const Connection = () => {
  useEagerConnect();
  useReduxSync();

  return null;
};

const Web3Root = ({ children }: { children: JSX.Element }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {children}
      <Connection />
    </Web3ReactProvider>
  );
};

export default Web3Root;
