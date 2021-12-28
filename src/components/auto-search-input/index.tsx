import {
  alpha,
  Autocomplete,
  Box,
  IconButton,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

const Container = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 10,
  paddingRight: "16px",
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
  "& .MuiButtonBase-root": {
    opacity: 0.5,
  },
  "&:hover .MuiButtonBase-root, &.Mui-focused .MuiButtonBase-root": {
    opacity: 1,
  },
}));

const AutoSearchInput = ({
  placeholder,
  onSearchSubmit,
  options,
}: {
  placeholder: string;
  onSearchSubmit: (type: string, value: string) => void;
  options: Array<{ id: string; label: string; type: string }>;
}) => {
  const [input, setInput] = useState<[string, string]>(() => ["", ""]);

  useEffect(() => {
    const [type, value] = input || [];
    if ((type && value) || (!type && !value)) {
      onSearchSubmit(type, value);
    }
  }, [input]);

  return (
    <Container>
      <IconButton>
        <SearchIcon />
      </IconButton>
      <Autocomplete
        autoHighlight
        autoComplete
        sx={{
          width: "25ch",
          "& .MuiAutocomplete-popupIndicator": { display: "none" },
        }}
        getOptionLabel={(i) => i.label}
        options={options}
        onChange={(_, v) => setInput([v?.type || "", v?.label || ""])}
        renderOption={(props, option) => (
          <Box
            {...props}
            key={option.id}
            component="li"
            sx={{
              marginLeft: "10px",
              marginRight: "10px",
              borderRadius: "10px",
            }}
          >
            <Stack>
              <Typography variant={"subtitle2"}>{option.label}</Typography>
              <Typography variant={"caption"} sx={{ color: "text.secondary" }}>
                {option.type}
              </Typography>
            </Stack>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{ ...params.InputProps, disableUnderline: true }}
            variant={"standard"}
            placeholder={placeholder}
          />
        )}
      />
    </Container>
  );
};

export default AutoSearchInput;
