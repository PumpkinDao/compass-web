import {
  Box,
  Container,
  FormControl,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Select,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridOverlay } from "@mui/x-data-grid";
import { Pool, PoolsResult, SingleMatrix } from "../../redux/pumpkin-api/types";

type ContentProps = {
  chainsLookup: Record<string, SingleMatrix>;
  protocolsLookup: Record<string, SingleMatrix>;
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
  chainsLookup,
  protocolsLookup,
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
        chainsLookup={chainsLookup}
        protocolsLookup={protocolsLookup}
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
      onFilterChanged("investTokenType", id === "all" ? "" : id);
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
      cur.tags?.forEach((tag: string) => {
        tag = tag.toLowerCase();
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
      <Box display={"none"}>
        <DetailFilter
          label={"Token"}
          items={tokens}
          onItemSelected={(id) => onFilterChanged("token", id)}
        />
      </Box>
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

const renderPoolCell: GridColDef["renderCell"] = (params) => {
  const {
    pool,
    protocol,
    chain,
  }: { pool: Pool; protocol: SingleMatrix; chain: SingleMatrix } =
    params.value || {};

  return (
    <Stack aria-label={`pool-updated-at-${pool.createdAt}`}>
      <Typography fontSize={16}>{pool?.name || "---"}</Typography>
      <Box marginTop={"3px"} />
      <Stack direction={"row"} alignItems={"center"}>
        <Typography fontSize={14}>{protocol?.name || "---"}</Typography>
        <Box marginLeft={1} />
        {chain?.icon && (
          <img
            src={chain.icon}
            alt={chain.name}
            style={{ width: 12, height: 12 }}
          />
        )}
      </Stack>
      <Box marginTop={"3px"} />
      {Array.isArray(protocol?.tags) && protocol.tags.length > 0 && (
        <Typography
          fontSize={12}
          fontWeight={"bold"}
          sx={{ color: "text.secondary" }}
        >
          {protocol.tags[0]}
        </Typography>
      )}
    </Stack>
  );
};

const renderLinkCell: GridColDef["renderCell"] = (params) => {
  const { link, name } = params.value || { link: "#", name: "---" };

  return (
    <Link href={link} target={"_blank"} underline={"none"}>
      {name}
    </Link>
  );
};

const renderTVLCell: GridColDef["renderCell"] = (params) => {
  const value = params.value || 0;
  const tvl =
    typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : 0;
  return <Typography variant={"inherit"}>${tvl.toLocaleString()}</Typography>;
};

const DATA_COLUMNS: GridColDef[] = [
  { field: "id", hide: true },
  {
    field: "pool",
    headerName: "POOL",
    flex: 4,
    sortable: false,
    renderCell: renderPoolCell,
  },
  {
    field: "invest_token",
    headerName: "Invest Token",
    flex: 4,
    sortable: false,
  },
  {
    field: "tvl",
    headerName: "TVL",
    flex: 2,
    type: "number",
    renderCell: renderTVLCell,
  },
  {
    field: "apy",
    headerName: "APY",
    flex: 2,
    headerAlign: "right",
    align: "right",
    cellClassName: "StyledDataGrid-cell-apy",
  },
  {
    field: "link",
    headerName: "LINK",
    flex: 3,
    sortable: false,
    headerAlign: "right",
    align: "right",
    renderCell: renderLinkCell,
  },
];

const DataGridLoadingOverlay = () => (
  <GridOverlay>
    <div style={{ position: "absolute", top: 0, width: "100%" }}>
      <LinearProgress />
    </div>
  </GridOverlay>
);

const StyledDataGrid = styled(DataGrid)(() => ({
  minHeight: 600,
  border: "revert",
  "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders": {
    border: "revert",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within":
    {
      outline: "revert",
    },
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-columnHeader--alignRight .MuiDataGrid-columnHeaderTitleContainer":
    {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-columnHeader--sorted .MuiDataGrid-iconButtonContainer":
    {
      width: "auto",
      visibility: "visible",
    },
  "& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortIcon":
    {
      opacity: "0.1",
    },

  "& .StyledDataGrid-cell-apy": {
    color: "#56F00DD9",
  },
}));

const DataBlock = ({
  pageIndex,
  pageSize,
  onPageSizeChanged,
  onPageIndexChange,
  isFetchingPools,
  poolsResult,
  onSortChanged,
  chainsLookup,
  protocolsLookup,
}: Pick<
  ContentProps,
  | "pageIndex"
  | "pageSize"
  | "onPageSizeChanged"
  | "onPageIndexChange"
  | "isFetchingPools"
  | "poolsResult"
  | "onSortChanged"
  | "chainsLookup"
  | "protocolsLookup"
>) => {
  const rows = useMemo(() => {
    return (poolsResult?.data || []).map((pool) => ({
      id: `${pool.protocolId}/${pool.chainId}/${pool.name}`,
      pool: {
        pool,
        chain: chainsLookup[pool.chainId],
        protocol: protocolsLookup[pool.protocolId],
      },
      invest_token:
        pool.investTokens
          ?.map((i) => (typeof i === "string" && i ? i : "UNKNOWN"))
          .join(", ") || "UNKNOWN",
      tvl: pool.tvl,
      apy: `${(Number(pool.apy) * 100).toFixed(2)}%`,
      link: protocolsLookup[pool.protocolId],
    }));
  }, [poolsResult, chainsLookup, protocolsLookup]);

  return (
    <StyledDataGrid
      autoHeight
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableDensitySelector
      disableSelectionOnClick
      density={"comfortable"}
      rowHeight={65}
      showCellRightBorder={false}
      showColumnRightBorder={false}
      components={{
        LoadingOverlay: DataGridLoadingOverlay,
      }}
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
