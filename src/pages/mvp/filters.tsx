import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { SingleMatrix } from "../../redux/pumpkin-api/types";

type FilterProps = {
  tokens: Array<SingleMatrix>;
  tags: Array<SingleMatrix>;
  protocols: Array<SingleMatrix>;
  onFilterChanged: (type: string, val: string) => void;
};

const Filters = ({ tokens, tags, protocols, onFilterChanged }: FilterProps) => {
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

const DetailFilterGroup = ({
  tokens,
  tags,
  protocols,
  onFilterChanged,
}: FilterProps) => {
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

export default Filters;
