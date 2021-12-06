import { Box } from "@mui/material";
import Header from "./header";
import Content from "./content";
import { useLazyPoolsQuery, useMatrixQuery } from "../../redux/pumpkin-api";
import { useCallback, useEffect, useState } from "react";
import { PoolsArg } from "../../redux/pumpkin-api/types";

const INIT_POOLS_ARG: PoolsArg = {
  pageIndex: 0,
  pageSize: 30,
  apyAsc: false,
};

const useBusiness = () => {
  const { data: matrix } = useMatrixQuery(undefined);

  const [poolsArg, setPoolsArg] = useState<PoolsArg>(INIT_POOLS_ARG);
  const updatePoolsArg = useCallback(
    (newVal: Partial<PoolsArg>) => {
      console.log("newVal: ", newVal);
      setPoolsArg((oldVal) => Object.assign({}, oldVal, newVal));
    },
    [setPoolsArg]
  );
  const [fetchPools, { data: poolsResult, isFetching: isFetchingPools }] =
    useLazyPoolsQuery();

  const onChainChanged = useCallback(
    (chainId: string) => {
      updatePoolsArg({ chainId });
    },
    [updatePoolsArg]
  );

  const onFilterChanged = useCallback(
    (filterType: string, val: string) => {
      if (filterType === "tag" || filterType === "protocol") {
        // todo
      }

      console.log("filterType: ", filterType, ", val: ", val);
    },
    [poolsArg, updatePoolsArg]
  );

  useEffect(() => {
    fetchPools(poolsArg);
  }, [poolsArg]);

  return {
    matrix,
    isFetchingPools,
    poolsResult,
    onChainChanged,
    onFilterChanged,
  };
};

const MVP = () => {
  const {
    matrix,
    isFetchingPools,
    poolsResult,
    onChainChanged,
    onFilterChanged,
  } = useBusiness();

  return (
    <>
      <Header chains={matrix?.chains || []} onChainChanged={onChainChanged} />
      <Box marginTop={16} />
      <Content
        tokens={[]}
        categories={matrix?.tags || []}
        protocols={matrix?.protocols || []}
        isFetchingPools={isFetchingPools}
        poolsResult={poolsResult}
        onFilterChanged={onFilterChanged}
      />
    </>
  );
};

export default MVP;
