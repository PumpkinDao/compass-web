import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Web3Provider } from "@ethersproject/providers";

const { ethereum } = window;
ethereum && (ethereum.autoRefreshOnNetworkChange = false);

const RPC_URLS = {
  1: process.env.REACT_APP_EVM_1_RPC_URL as string,
};

const injected = new InjectedConnector({ supportedChainIds: [1] });

const walletConnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  chainId: 1,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

export const connectors = {
  injected,
  walletConnect,
};
export type ConnectorName = keyof typeof connectors;

export const getLibrary = (provider: unknown): Web3Provider => {
  const library = new Web3Provider(provider as never);
  library.pollingInterval = 15_000;

  return library;
};
