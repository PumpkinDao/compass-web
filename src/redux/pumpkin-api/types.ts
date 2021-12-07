export type SingleMatrix = {
  id: string;
  name: string;
  url?: string;
  tags?: string[];
  chainIds?: string[];
};

export type MatrixResult = {
  chains: SingleMatrix[];
  tags: SingleMatrix[];
  protocols: SingleMatrix[];
};

export type PoolsArg =
  | {
      protocolId?: string | string[];
      chainId?: string;
      address?: string;
      pageIndex?: number;
      pageSize?: number;
      apyAsc?: boolean;
      tvlAsc?: boolean;
    }
  | undefined;

export type PoolsResult =
  | undefined
  | {
      page: {
        size: number;
        index: number;
      };
      total: number;
      data: Array<{
        protocolId: string;
        chainId: string;
        name: string;
        address: string;
        apy: number;
        tvl: number;
        createdAt: number;
      }>;
    };
