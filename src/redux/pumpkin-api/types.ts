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
};

export type PoolsArg =
  | {
      protocolId?: string | string[];
      chainId?: string;
      address?: string;
      pageIndex?: number;
      pageSize?: number;
      aprAsc?: boolean;
      tvlAsc?: boolean;
    }
  | undefined;

export type Pool = {
  protocolId: string;
  chainId: string;
  name: string;
  address: string;
  apr: number;
  tvl: number;
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