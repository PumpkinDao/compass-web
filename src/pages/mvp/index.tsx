import { Box, Container } from "@mui/material";
import Header from "./header";
import DataBlock from "./data-block";
import { useLazyPoolsQuery, useMatrixQuery } from "../../redux/compass-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PoolsArg } from "../../redux/compass-api/types";
import Filters from "./filters";
import Footer from "./footer";
import { useSearchParams } from "react-router-dom";

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

  const [chainTags, searchProtocolsByTag] = useMemo(() => {
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

    return [subTags, lookup];
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValues, setSearchValues] = useState<
    Array<{ id: string; type: string; label: string }>
  >([]);

  const onSearchUpdated = useCallback(
    (values: Array<{ id: string; type: string; label: string }>) => {
      console.log("searchValues: ", values);
      setSearchValues(values);
      setSearchParams(
        new URLSearchParams(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          values.reduce<Record<string, string[]>>((acc, cur) => {
            const normalType = cur.type.toLowerCase();
            if (!acc[normalType]) {
              acc[normalType] = [];
            }

            acc[normalType].push(cur.label);

            return acc;
          }, {})
        )
      );
    },
    [setSearchValues, setSearchParams]
  );

  useEffect(() => {
    if (!searchOptions) {
      return;
    }

    const protocolIds = searchParams.get("protocol")?.split(",");
    const investTokens = searchParams.get("token")?.split(",");
    const values = [];
    protocolIds &&
      values.push(
        ...searchOptions.filter(
          (i) => i.type === "Protocol" && protocolIds.includes(i.label)
        )
      );
    investTokens &&
      values.push(
        ...searchOptions.filter(
          (i) => i.type === "Token" && investTokens.includes(i.label)
        )
      );

    setSearchValues(values as never);
  }, [searchOptions]);

  useEffect(() => {
    if (!searchParams || !updatePoolsArg) {
      return;
    }

    const protocolIds = searchParams.get("protocol")?.split(",");
    const investTokens = searchParams.get("token")?.split(",");
    updatePoolsArg({
      protocolId: protocolIds && protocolIds.map((i) => i.toLowerCase()),
      investTokens: investTokens,
    });
  }, [searchParams, updatePoolsArg]);

  return {
    chainsLookup,
    protocolsLookup,
    searchOptions,
    selectedChainId,
    chains: chains || [],
    tags: chainTags,
    isFetchingPools,
    poolsResult,
    onChainChanged,
    onFilterChanged,
    onSortChanged,
    pageIndex: poolsArg?.pageIndex || 0,
    pageSize: poolsArg?.pageSize || 25,
    onPageSizeChanged,
    onPageIndexChanged,
    onSearchUpdated,
    searchValues,
  };
};

const MVP = () => {
  const {
    chainsLookup,
    protocolsLookup,
    searchOptions,
    selectedChainId,
    chains,
    tags,
    isFetchingPools,
    poolsResult,
    onChainChanged,
    onFilterChanged,
    onSortChanged,
    pageIndex,
    pageSize,
    onPageSizeChanged,
    onPageIndexChanged,
    onSearchUpdated,
    searchValues,
  } = useBusiness();

  return (
    <>
      <Header
        selectedChainId={selectedChainId}
        chains={chains || []}
        onChainChanged={onChainChanged}
        onSearchUpdated={onSearchUpdated}
        searchOptions={searchOptions}
        searchValues={searchValues}
      />
      <Box marginTop={20} />
      <Container maxWidth={"lg"}>
        <Filters tags={tags} onFilterChanged={onFilterChanged} />
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
