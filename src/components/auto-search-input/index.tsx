import {
  alpha,
  Autocomplete,
  Box,
  Chip,
  IconButton,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Container = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 10,
  paddingRight: "16px",
  backgroundColor: alpha(theme.palette.common.white, 0.25),
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const AutoSearchInput = ({
  placeholder,
  onSearchUpdated,
  searchValues,
  options,
}: {
  placeholder: string;
  onSearchUpdated: (
    values: Array<{ id: string; label: string; type: string }>
  ) => void;
  searchValues: Array<{ id: string; type: string; label: string }>;
  options: Array<{ id: string; label: string; type: string }>;
}) => {
  return (
    <Container>
      <IconButton>
        <SearchIcon />
      </IconButton>
      <Autocomplete
        multiple
        autoHighlight
        autoComplete
        sx={{
          width: "30ch",
          "& .MuiAutocomplete-popupIndicator": { display: "none" },
        }}
        size={"small"}
        getOptionLabel={(i) => i.label}
        options={options}
        onChange={(_, v) => onSearchUpdated(v)}
        value={searchValues}
        renderTags={(value, getTagProps) => (
          <Stack
            direction={"row"}
            overflow={"auto"}
            sx={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {value
              .map((option, index) => (
                // eslint-disable-next-line react/jsx-key
                <Chip
                  color={option.type === "Protocol" ? "primary" : "default"}
                  label={option.label}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
              .reverse()}
          </Stack>
        )}
        renderOption={(props, option) => (
          <Box
            {...props}
            key={option.id}
            component="li"
            sx={{
              marginLeft: "10px",
              marginRight: "10px",
              marginBottom: "10px",
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
