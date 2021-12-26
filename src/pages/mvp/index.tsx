import { Box, Container } from "@mui/material";
import Header from "./header";
import DataBlock from "./data-block";
import { useLazyPoolsQuery, useMatrixQuery } from "../../redux/compass-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PoolsArg } from "../../redux/compass-api/types";
import Filters from "./filters";
import Footer from "./footer";

const INIT_POOLS_ARG: PoolsArg = {
  pageIndex: 0,
  pageSize: 15,
  apyAsc: false,
};

const useBusiness = () => {
  const { data: matrix } = useMatrixQuery(undefined);
  const { chains, tags, protocols, investTokens } = matrix || {};

  const [chainsLookup, protocolsLookup, searchOptions] = useMemo(() => {
    const theChains = chains || [];
    const theProtocols = protocols || [];
    const theInvestTokens = investTokens || [];

    return [
      Object.fromEntries(theChains.map((i) => [i.id, i])),
      Object.fromEntries(theProtocols.map((i) => [i.id, i])),
      [
        ...theProtocols.map((i) => ({
          type: "Protocol",
          id: i.id,
          label: i.name,
        })),
        ...theInvestTokens.map((i) => ({
          type: "Token",
          id: i.id,
          label: i.name,
        })),
      ],
    ];
  }, [chains, protocols, investTokens]);

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
        cur.tags?.forEach((tag: string) => {
          tag = tag.toLowerCase();
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
      } else if (filterType === "investTokenType") {
        updatePoolsArg({
          investTokenType: val as "single" | "multi" | undefined,
        });
      }
    },
    [updatePoolsArg, searchProtocolsByTag]
  );

  const onSortChanged = useCallback(
    (sortType: string, val: string) => {
      let apyAsc: boolean | undefined = undefined;
      let tvlAsc: boolean | undefined = undefined;

      if (sortType === "apy") {
        apyAsc = val === "asc";
      } else if (sortType === "tvl") {
        tvlAsc = val === "asc";
      }
      updatePoolsArg({ apyAsc: apyAsc, tvlAsc });
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

  const onSearchSubmit = useCallback(
    (type: string, input: string) => {
      const [protocolId, investToken] =
        type === "Protocol" ? [input.toLowerCase(), ""] : ["", input];
      updatePoolsArg({ protocolId, investToken });
    },
    [updatePoolsArg]
  );

  return {
    chainsLookup,
    protocolsLookup,
    searchOptions,
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
    onSearchSubmit,
  };
};

const MVP = () => {
  const {
    chainsLookup,
    protocolsLookup,
    searchOptions,
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
    onSearchSubmit,
  } = useBusiness();

  return (
    <>
      <Header
        selectedChainId={selectedChainId}
        chains={chains || []}
        onChainChanged={onChainChanged}
        onSearchSubmit={onSearchSubmit}
        searchOptions={searchOptions}
      />
      <Box marginTop={20} />
      <Container maxWidth={"lg"}>
        <Filters
          tokens={tokens}
          tags={tags}
          protocols={protocols}
          onFilterChanged={onFilterChanged}
        />
        <Box marginTop={8} />
        <DataBlock
          chainsLookup={chainsLookup}
          protocolsLookup={protocolsLookup}
          isFetchingPools={isFetchingPools}
          poolsResult={poolsResult}
          onSortChanged={onSortChanged}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageIndexChange={onPageIndexChanged}
          onPageSizeChanged={onPageSizeChanged}
        />
        <Box marginBottom={16} />
        <Footer />
      </Container>
    </>
  );
};

export default MVP;
