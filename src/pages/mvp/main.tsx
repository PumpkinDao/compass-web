import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

const PoolFilterGroup = () => {
  return (
    <ToggleButtonGroup value={"all"}>
      <ToggleButton value={"all"}>All</ToggleButton>
      <ToggleButton value={"single_token"}>Single Token</ToggleButton>
      <ToggleButton value={"multi_token"}>Multi Token</ToggleButton>
    </ToggleButtonGroup>
  );
};

const DetailFilter = ({
  label,
  selectedId,
  items,
  onItemSelected,
}: {
  label: string;
  selectedId: string;
  items: Array<{ id: string; label: string }>;
  onItemSelected: (id: string) => void;
}) => {
  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedId}
        label={label}
        onChange={(event) => onItemSelected(event.target.value)}
      >
        {items.map((i) => (
          <MenuItem key={i.id} value={i.id}>
            {i.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const DetailFilterGroup = () => {
  const range = (num: number) => Array(num).fill(undefined);

  const tokens = range(10)
    .map((_, index) => `Token${index}`)
    .map((i) => ({ id: i, label: i }));

  const categories = range(5)
    .map((_, index) => `Category${index}`)
    .map((i) => ({ id: i, label: i }));

  const protocols = range(15)
    .map((_, index) => `Protocol${index}`)
    .map((i) => ({ id: i, label: i }));

  const [selectedToken, setSelectedToken] = useState<string>(
    () => tokens[0].id
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => categories[0].id
  );
  const [selectedProtocol, setSelectedProtocol] = useState<string>(
    () => protocols[0].id
  );

  return (
    <Stack direction={"row"} spacing={2}>
      <DetailFilter
        label={"Token"}
        selectedId={selectedToken}
        items={tokens}
        onItemSelected={setSelectedToken}
      />
      <DetailFilter
        label={"Category"}
        selectedId={selectedCategory}
        items={categories}
        onItemSelected={setSelectedCategory}
      />
      <DetailFilter
        label={"Protocol"}
        selectedId={selectedProtocol}
        items={protocols}
        onItemSelected={setSelectedProtocol}
      />
    </Stack>
  );
};

const FiltersBlock = () => {
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <PoolFilterGroup />
      <DetailFilterGroup />
    </Stack>
  );
};

const DATA_COLUMNS: GridColDef[] = [
  { field: "id", hide: true },
  { field: "pool", headerName: "POOL", flex: 5, sortable: false },
  { field: "tvl", headerName: "TVL", flex: 2 },
  { field: "apy", headerName: "APY", flex: 2 },
  { field: "link", headerName: "LINK", flex: 1, sortable: false },
];

const DATA_ROWS: GridRowsProp = [
  {
    id: 1,
    pool: "BNB-USDT",
    tvl: "$1,234,1439",
    apy: "53.56%",
    link: "Website",
  },
  {
    id: 2,
    pool: "BNB-USDT",
    tvl: "$1,234,1439",
    apy: "53.56%",
    link: "Website",
  },
  {
    id: 3,
    pool: "BNB-USDT",
    tvl: "$1,234,1439",
    apy: "53.56%",
    link: "Website",
  },
  {
    id: 4,
    pool: "BNB-USDT",
    tvl: "$1,234,1439",
    apy: "53.56%",
    link: "Website",
  },
  {
    id: 5,
    pool: "BNB-USDT",
    tvl: "$1,234,1439",
    apy: "53.56%",
    link: "Website",
  },
];

const DataBlock = () => {
  return (
    <Box sx={{ height: 400 }}>
      <DataGrid
        columns={DATA_COLUMNS}
        rows={DATA_ROWS}
        disableSelectionOnClick
        disableColumnMenu
      />
    </Box>
  );
};

const Main = () => {
  return (
    <Container maxWidth={"lg"}>
      <FiltersBlock />
      <Box marginTop={8} />
      <DataBlock />
    </Container>
  );
};

export default Main;
