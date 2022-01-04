import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useCallback, useState } from "react";
import { SingleMatrix } from "../../redux/compass-api/types";

type FilterProps = {
  tags: Array<SingleMatrix>;
  onFilterChanged: (type: string, val: string) => void;
};

const Filters = ({ tags, onFilterChanged }: FilterProps) => {
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <PoolFilterGroup onFilterChanged={onFilterChanged} />
      <DetailFilterGroup tags={tags} onFilterChanged={onFilterChanged} />
    </Stack>
  );
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  "& .MuiToggleButton-root": {
    textTransform: "revert",
  },
}));

const PoolFilterGroup = ({
  onFilterChanged,
}: Pick<FilterProps, "onFilterChanged">) => {
  const [selectedId, setSelectedId] = useState<string>("all");
  const onChange = useCallback(
    (id: string) => {
      setSelectedId(id);
      onFilterChanged("investTokenType", id === "all" ? "" : id);
    },
    [setSelectedId]
  );

  return (
    <StyledToggleButtonGroup
      exclusive
      value={selectedId}
      onChange={(_, newVal) => onChange(newVal)}
    >
      <ToggleButton value={"all"}>All</ToggleButton>
      <ToggleButton value={"single"}>Single Token</ToggleButton>
      <ToggleButton value={"multi"}>Multi Token</ToggleButton>
    </StyledToggleButtonGroup>
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

const DetailFilterGroup = ({ tags, onFilterChanged }: FilterProps) => {
  return (
    <Stack direction={"row"} spacing={2}>
      <DetailFilter
        label={"Category"}
        items={tags}
        onItemSelected={(id) => {
          onFilterChanged("tag", id);
        }}
      />
    </Stack>
  );
};

export default Filters;
