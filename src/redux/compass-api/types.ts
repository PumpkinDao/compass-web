export type SingleMatrix = {
  id: string;
  name: string;
  icon?: string;
  link?: string;
  tags?: string[];
  chainIds?: string[];
};

export type MatrixResult = {
  chains: SingleMatrix[];
  tags: SingleMatrix[];
  protocols: SingleMatrix[];
  investTokens: SingleMatrix[];
};

export type PoolsArg =
  | {
      protocolId?: string | string[];
      investTokens?: string[];
      chainId?: string;
      address?: string;
      pageIndex?: number;
      pageSize?: number;
      apyAsc?: boolean;
      tvlAsc?: boolean;
      investTokenType?: "single" | "multi";
    }
  | undefined;

export type Token = {
  name: string;
  symbol: string;
  address: string;
};

export type Pool = {
  protocolId: string;
  chainId: string;
  name: string;
  address: string;
  apy: number;
  tvl: number;
  investTokens: Token[];
  createdAt: number;
};

export type PoolsResult =
  | undefined
  | {
      page: {
        size: number;
        index: number;
      };
      total: number;
      data: Array<Pool>;
    };
