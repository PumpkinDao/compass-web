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

const PoolFilterGroup = ({
  onFilterChanged,
}: {
  onFilterChanged: (type: string, val: string) => void;
}) => {
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

const PLACEHOLDER = "placeholder";

const DetailFilter = ({
  label,
  items,
  onItemSelected: onItemSelectedOuter,
}: {
  label: string;
  items: Array<{ id: string; name: string }>;
  onItemSelected: (id: string) => void;
}) => {
  items = [{ id: PLACEHOLDER, name: "CANCEL" }, ...items];
  const [selectedId, setSelectedId] = useState<string>("");

  const onItemSelected = useCallback(
    (id) => {
      id = id === PLACEHOLDER ? "" : id;
      setSelectedId(id);
      onItemSelectedOuter(id);
    },
    [setSelectedId]
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
  categories,
  protocols,
  onFilterChanged,
}: {
  tokens: Array<SingleMatrix>;
  categories: Array<SingleMatrix>;
  protocols: Array<SingleMatrix>;
  onFilterChanged: (type: string, val: string) => void;
}) => {
  return (
    <Stack direction={"row"} spacing={2}>
      <DetailFilter
        label={"Token"}
        items={tokens}
        onItemSelected={(id) => onFilterChanged("token", id)}
      />
      <DetailFilter
        label={"Category"}
        items={categories}
        onItemSelected={(id) => onFilterChanged("tag", id)}
      />
      <DetailFilter
        label={"Protocol"}
        items={protocols}
        onItemSelected={(id) => onFilterChanged("protocol", id)}
      />
    </Stack>
  );
};

const FiltersBlock = ({
  tokens,
  categories,
  protocols,
  onFilterChanged,
}: {
  tokens: Array<SingleMatrix>;
  categories: Array<SingleMatrix>;
  protocols: Array<SingleMatrix>;
  onFilterChanged: (type: string, val: string) => void;
}) => {
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <PoolFilterGroup onFilterChanged={onFilterChanged} />
      <DetailFilterGroup
        tokens={tokens}
        categories={categories}
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
  { field: "apy", headerName: "APY", flex: 2 },
  { field: "tvl", headerName: "TVL", flex: 2 },
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
  isFetchingPools,
  poolsResult,
}: {
  isFetchingPools: boolean;
  poolsResult: PoolsResult | undefined;
}) => {
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
      components={{
        LoadingOverlay: DataGridLoadingOverlay,
      }}
      loading={isFetchingPools}
      columns={DATA_COLUMNS}
      rows={rows}
      disableSelectionOnClick
      disableColumnFilter
      disableColumnSelector
      disableColumnMenu
      disableDensitySelector
      sx={{ minHeight: 600 }}
      pageSize={10}
      rowCount={poolsResult?.total || 0}
    />
  );
};

const Content = ({
  tokens,
  categories,
  protocols,
  onFilterChanged,
  isFetchingPools,
  poolsResult,
}: {
  tokens: Array<SingleMatrix>;
  categories: Array<SingleMatrix>;
  protocols: Array<SingleMatrix>;
  onFilterChanged: (type: string, val: string) => void;
  isFetchingPools: boolean;
  poolsResult: PoolsResult | undefined;
}) => {
  return (
    <Container maxWidth={"lg"}>
      <FiltersBlock
        tokens={tokens}
        categories={categories}
        protocols={protocols}
        onFilterChanged={onFilterChanged}
      />
      <Box marginTop={8} />
      <DataBlock isFetchingPools={isFetchingPools} poolsResult={poolsResult} />
    </Container>
  );
};

export default Content;
