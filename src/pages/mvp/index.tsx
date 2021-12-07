import { Box } from "@mui/material";
import Header from "./header";
import Content from "./content";
import { useLazyPoolsQuery, useMatrixQuery } from "../../redux/pumpkin-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PoolsArg } from "../../redux/pumpkin-api/types";

const INIT_POOLS_ARG: PoolsArg = {
  pageIndex: 0,
  pageSize: 15,
  apyAsc: false,
};

const useBusiness = () => {
  const { data: matrix } = useMatrixQuery(undefined);
  const { chains, tags, protocols } = matrix || {};

  const [poolsArg, setPoolsArg] = useState<PoolsArg>(INIT_POOLS_ARG);
  const updatePoolsArg = useCallback(
    (newVal: Partial<PoolsArg>) => {
      setPoolsArg((oldVal) => {
        let state = Object.assign({}, oldVal, newVal);
        state = Object.fromEntries(
          Object.entries(state).filter(
            ([, v]) =>
              !(typeof v === "undefined" || (typeof v === "string" && !v))
          )
        );
        console.log("state: ", state);
        return state;
      });
    },
    [setPoolsArg]
  );
  const [fetchPools, { data: poolsResult, isFetching: isFetchingPools }] =
    useLazyPoolsQuery();

  useEffect(() => {
    fetchPools(poolsArg);
  }, [poolsArg]);

  const [selectedChainId, setSelectedChainId] = useState<string>("");

  const onChainChanged = useCallback(
    (chainId: string) => {
      setSelectedChainId(chainId);
      updatePoolsArg({ chainId, protocolId: "" });
    },
    [setSelectedChainId, updatePoolsArg]
  );

  const searchProtocolsByChain = useMemo(() => {
    return (protocols || []).reduce<Record<string, Set<string>>>((acc, cur) => {
      cur.chainIds?.forEach((chainId) => {
        if (!acc[chainId]) {
          acc[chainId] = new Set();
        }
        acc[chainId].add(cur.id);
      });

      return acc;
    }, {});
  }, [protocols]);

  const [chainProtocols, chainTags, searchProtocolsByTag] = useMemo(() => {
    let subProtocols = protocols || [];

    if (selectedChainId) {
      const protocolIdsOnSelectedChain =
        searchProtocolsByChain[selectedChainId];
      protocolIdsOnSelectedChain &&
        (subProtocols = subProtocols.filter((i) =>
          protocolIdsOnSelectedChain.has(i.id)
        ));
    }

    const lookup = subProtocols.reduce<Record<string, Set<string>>>(
      (acc, cur) => {
        cur.tags?.forEach((tag) => {
          if (!acc[tag]) {
            acc[tag] = new Set();
          }
          acc[tag].add(cur.id);
        });
        return acc;
      },
      {}
    );

    const tagSet = new Set(Object.keys(lookup));
    const subTags = (tags || []).filter((i) => tagSet.has(i.id));
    return [subProtocols, subTags, lookup];
  }, [selectedChainId, searchProtocolsByChain, protocols, tags]);

  const onFilterChanged = useCallback(
    (filterType: string, val: string) => {
      if (filterType === "tag") {
        const protocolIds = Array.from(searchProtocolsByTag[val] || []);
        updatePoolsArg({ protocolId: protocolIds });
      } else if (filterType === "protocol") {
        updatePoolsArg({ protocolId: val });
      }
    },
    [updatePoolsArg, searchProtocolsByTag]
  );

  const onSortChanged = useCallback(
    (sortType: string, val: string) => {
      console.log("sortType: ", sortType, ", val: ", val);
      let apyAsc: boolean | undefined = undefined;
      let tvlAsc: boolean | undefined = undefined;

      if (sortType === "apy") {
        apyAsc = val === "asc";
      } else if (sortType === "tvl") {
        tvlAsc = val === "asc";
      }
      updatePoolsArg({ apyAsc, tvlAsc });
    },
    [updatePoolsArg]
  );

  const onPageIndexChanged = useCallback(
    (pageIndex) => {
      updatePoolsArg({ pageIndex });
    },
    [updatePoolsArg]
  );

  const onPageSizeChanged = useCallback(
    (pageSize) => {
      updatePoolsArg({ pageSize });
    },
    [updatePoolsArg]
  );

  console.log("poolsArg: ", poolsArg);

  return {
    selectedChainId,
    chains: chains || [],
    tokens: [],
    tags: chainTags,
    protocols: chainProtocols,
    isFetchingPools,
    poolsResult,
    onChainChanged,
    onFilterChanged,
    onSortChanged,
    pageIndex: poolsArg?.pageIndex || 0,
    pageSize: poolsArg?.pageSize || 25,
    onPageSizeChanged,
    onPageIndexChanged,
  };
};

const MVP = () => {
  const {
    selectedChainId,
    chains,
    tokens,
    tags,
    protocols,
    isFetchingPools,
    poolsResult,
    onChainChanged,
    onFilterChanged,
    onSortChanged,
    pageIndex,
    pageSize,
    onPageSizeChanged,
    onPageIndexChanged,
  } = useBusiness();

  return (
    <>
      <Header
        selectedChainId={selectedChainId}
        chains={chains || []}
        onChainChanged={onChainChanged}
      />
      <Box marginTop={16} />
      <Content
        selectedChainId={selectedChainId}
        tokens={tokens}
        tags={tags}
        protocols={protocols}
        isFetchingPools={isFetchingPools}
        poolsResult={poolsResult}
        onFilterChanged={onFilterChanged}
        onSortChanged={onSortChanged}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageIndexChange={onPageIndexChanged}
        onPageSizeChanged={onPageSizeChanged}
      />
    </>
  );
};

export default MVP;
