import {
  Box,
  LinearProgress,
  Link,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { DataGrid, GridColDef, GridOverlay } from "@mui/x-data-grid";
import {
  Pool,
  PoolsResult,
  SingleMatrix,
  Token,
} from "../../redux/pumpkin-api/types";
import TapToCopy from "../../components/tap-to-copy";

type DataProps = {
  chainsLookup: Record<string, SingleMatrix>;
  protocolsLookup: Record<string, SingleMatrix>;
  onSortChanged: (type: string, val: string) => void;
  isFetchingPools: boolean;
  poolsResult: PoolsResult | undefined;
  pageIndex: number;
  pageSize: number;
  onPageSizeChanged: (pageSize: number) => void;
  onPageIndexChange: (pageIndex: number) => void;
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

const renderInvestToken: GridColDef["renderCell"] = (params) => {
  const tokens: Token[] = params.value || [];
  const lastTokenIndex = tokens.length - 1;

  return (
    <Stack direction={"row"}>
      {tokens &&
        tokens.map(({ address, symbol }, index) => (
          <Tooltip key={address} title={<TapToCopy content={address} />}>
            <Typography color={"inherit"}>
              {symbol
                ? symbol
                : `${address.slice(0, 4)}...${address.slice(-4)}`}
              {index < lastTokenIndex && ", "}
            </Typography>
          </Tooltip>
        ))}
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
  return (
    <Typography variant={"inherit"}>${(tvl | 0).toLocaleString()}</Typography>
  );
};

const DATA_COLUMNS: GridColDef[] = [
  { field: "id", hide: true },
  {
    field: "pool",
    headerName: "Pool",
    flex: 4,
    sortable: false,
    renderCell: renderPoolCell,
  },
  {
    field: "invest_token",
    headerName: "Invest Token",
    flex: 4,
    sortable: false,
    renderCell: renderInvestToken,
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
    headerName: "Links",
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
}: DataProps) => {
  const rows = useMemo(() => {
    return (poolsResult?.data || []).map((pool) => ({
      id: `${pool.protocolId}/${pool.chainId}/${pool.name}`,
      pool: {
        pool,
        chain: chainsLookup[pool.chainId],
        protocol: protocolsLookup[pool.protocolId],
      },
      invest_token: pool.investTokens,
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

export default DataBlock;
