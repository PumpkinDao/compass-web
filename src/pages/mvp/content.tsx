import {
  Box,
  Container,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridOverlay } from "@mui/x-data-grid";
import { PoolsResult, SingleMatrix } from "../../redux/pumpkin-api/types";

type ContentProps = {
  selectedChainId: string;
  tokens: Array<SingleMatrix>;
  tags: Array<SingleMatrix>;
  protocols: Array<SingleMatrix>;
  onFilterChanged: (type: string, val: string) => void;
  onSortChanged: (type: string, val: string) => void;
  isFetchingPools: boolean;
  poolsResult: PoolsResult | undefined;
  pageIndex: number;
  pageSize: number;
  onPageSizeChanged: (pageSize: number) => void;
  onPageIndexChange: (pageIndex: number) => void;
};

const Content = ({
  selectedChainId,
  tokens,
  tags,
  protocols,
  onFilterChanged,
  onSortChanged,
  isFetchingPools,
  poolsResult,
  pageIndex,
  pageSize,
  onPageSizeChanged,
  onPageIndexChange,
}: ContentProps) => {
  return (
    <Container maxWidth={"lg"}>
      <FiltersBlock
        key={`filter-${selectedChainId}`}
        tokens={tokens}
        tags={tags}
        protocols={protocols}
        onFilterChanged={onFilterChanged}
      />
      <Box marginTop={8} />
      <DataBlock
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageSizeChanged={onPageSizeChanged}
        onPageIndexChange={onPageIndexChange}
        isFetchingPools={isFetchingPools}
        poolsResult={poolsResult}
        onSortChanged={onSortChanged}
      />
    </Container>
  );
};

const PoolFilterGroup = ({
  onFilterChanged,
}: Pick<ContentProps, "onFilterChanged">) => {
  const [selectedId, setSelectedId] = useState<string>("all");
  const onChange = useCallback(
    (id: string) => {
      setSelectedId(id);
      onFilterChanged("singleTokenPool", String(id === "single"));
    },
    [setSelectedId]
  );

  return (
    <ToggleButtonGroup
      exclusive
      value={selectedId}
      onChange={(_, newVal) => onChange(newVal)}
    >
      <ToggleButton value={"all"}>All</ToggleButton>
      <ToggleButton value={"single"}>Single Token</ToggleButton>
      <ToggleButton value={"multi"}>Multi Token</ToggleButton>
    </ToggleButtonGroup>
  );
};

const DetailFilter = ({
  label,
  items,
  onItemSelected: onItemSelectedOuter,
}: {
  label: string;
  items: Array<SingleMatrix>;
  onItemSelected: (id: string) => void;
}) => {
  const PLACEHOLDER = "placeholder";
  items = [{ id: PLACEHOLDER, name: label }, ...items];
  const [selectedId, setSelectedId] = useState<string>("");

  const onItemSelected = useCallback(
    (id) => {
      id = id === PLACEHOLDER ? "" : id;
      setSelectedId(id);
      onItemSelectedOuter(id);
    },
    [setSelectedId, onItemSelectedOuter]
  );

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedId}
        label={label}
        onChange={(event) => onItemSelected(event.target.value)}
        sx={{ minWidth: 120 }}
      >
        {items.map((i) => (
          <MenuItem
            key={i.id}
            value={i.id}
            sx={{ fontStyle: i.id === PLACEHOLDER ? "italic" : "inherit" }}
          >
            {i.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const DetailFilterGroup = ({
  tokens,
  tags,
  protocols,
  onFilterChanged,
}: Pick<ContentProps, "tokens" | "tags" | "protocols" | "onFilterChanged">) => {
  const [tag, setTag] = useState<string>("");

  const searchProtocolIdsByTag = useMemo(() => {
    return protocols.reduce<Record<string, Set<string>>>((acc, cur) => {
      cur.tags?.forEach((tag) => {
        if (!acc[tag]) {
          acc[tag] = new Set();
        }
        acc[tag].add(cur.id);
      });
      return acc;
    }, {});
  }, [protocols]);

  const subProtocols = useMemo(() => {
    if (tag && protocols) {
      const protocolIds = searchProtocolIdsByTag[tag];
      return protocols.filter((i) => protocolIds.has(i.id));
    } else {
      return protocols;
    }
  }, [tag, searchProtocolIdsByTag, protocols]);

  return (
    <Stack direction={"row"} spacing={2}>
      <DetailFilter
        label={"Token"}
        items={tokens}
        onItemSelected={(id) => onFilterChanged("token", id)}
      />
      <DetailFilter
        label={"Category"}
        items={tags}
        onItemSelected={(id) => {
          setTag(id);
          onFilterChanged("tag", id);
        }}
      />
      <DetailFilter
        key={`Protocols<${tag}>`}
        label={"Protocol"}
        items={subProtocols}
        onItemSelected={(id) => onFilterChanged("protocol", id)}
      />
    </Stack>
  );
};

const FiltersBlock = ({
  tokens,
  tags,
  protocols,
  onFilterChanged,
}: Pick<ContentProps, "tokens" | "tags" | "protocols" | "onFilterChanged">) => {
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <PoolFilterGroup onFilterChanged={onFilterChanged} />
      <DetailFilterGroup
        tokens={tokens}
        tags={tags}
        protocols={protocols}
        onFilterChanged={onFilterChanged}
      />
    </Stack>
  );
};

const DATA_COLUMNS: GridColDef[] = [
  { field: "id", hide: true },
  {
    field: "pool",
    headerName: "POOL",
    flex: 5,
    sortable: false,
  },
  { field: "tvl", headerName: "TVL", flex: 2 },
  { field: "apy", headerName: "APY", flex: 2 },
  { field: "link", headerName: "LINK", flex: 1, sortable: false },
];

const DataGridLoadingOverlay = () => (
  <GridOverlay>
    <div style={{ position: "absolute", top: 0, width: "100%" }}>
      <LinearProgress />
    </div>
  </GridOverlay>
);

const DataBlock = ({
  pageIndex,
  pageSize,
  onPageSizeChanged,
  onPageIndexChange,
  isFetchingPools,
  poolsResult,
  onSortChanged,
}: Pick<
  ContentProps,
  | "pageIndex"
  | "pageSize"
  | "onPageSizeChanged"
  | "onPageIndexChange"
  | "isFetchingPools"
  | "poolsResult"
  | "onSortChanged"
>) => {
  const rows = useMemo(() => {
    return (poolsResult?.data || []).map((pool) => ({
      id: `${pool.protocolId}/${pool.chainId}/${pool.name}`,
      pool: pool.name,
      tvl: pool.tvl,
      apy: `${(Number(pool.apy) * 100).toFixed(2)}%`,
      link: pool.protocolId, // todo
    }));
  }, [poolsResult]);

  return (
    <DataGrid
      autoHeight
      disableSelectionOnClick
      disableColumnFilter
      disableColumnSelector
      disableColumnMenu
      disableDensitySelector
      components={{
        LoadingOverlay: DataGridLoadingOverlay,
      }}
      sx={{ minHeight: 600 }}
      sortingMode={"server"}
      onSortModelChange={([sortItem]) =>
        onSortChanged(
          sortItem?.field || "",
          typeof sortItem?.sort === "string" ? sortItem.sort : ""
        )
      }
      pagination
      paginationMode={"server"}
      page={pageIndex}
      onPageChange={(page) => onPageIndexChange(page)}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChanged}
      rowsPerPageOptions={[15, 35, 50]}
      rowCount={poolsResult?.total || 0}
      initialState={{
        sorting: { sortModel: [{ field: "apy", sort: "desc" }] },
      }}
      loading={isFetchingPools}
      columns={DATA_COLUMNS}
      rows={rows}
    />
  );
};

export default Content;
