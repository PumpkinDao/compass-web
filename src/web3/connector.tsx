import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";

const { ethereum } = window;
ethereum && (ethereum.autoRefreshOnNetworkChange = false);

export const getLibrary = (provider?: {
  chainId: number | string;
}): Web3Provider => {
  const library = new Web3Provider(
    provider as never,
    typeof provider?.chainId === "number"
      ? provider.chainId
      : typeof provider?.chainId === "string"
      ? parseInt(provider.chainId)
      : "any"
  );
  library.pollingInterval = 15_000;

  return library;
};

export const injectedNetworkConnector = new InjectedConnector({});
