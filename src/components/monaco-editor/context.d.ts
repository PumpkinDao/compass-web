declare const cache: Record<string, string | number | boolean>;
declare namespace evm {
  /**
   *
   * @param network
   * @return Provider https://docs.ethers.io/v5/api/providers/provider/
   */
  function getProvider(
    network:
      | "ethereum"
      | "ropsten"
      | "bsc"
      | "polygon"
      | "ftm"
      | "avax"
      | "optimism"
      | "arbitrum"
      | "moonriver"
  ): any;
}

/**
 * see https://github.com/ethers-io/ethers.js/blob/master/packages/ethers/lib/ethers.d.ts
 */
declare const ethers: any;
