/// <reference types="react-scripts" />

interface Window {
  ethereum?: {
    isMetaMask?: true;
    autoRefreshOnNetworkChange?: boolean;
  };
  web3?: Record<string, unknown>;
}
