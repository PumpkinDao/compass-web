import { alpha, IconButton, InputBase, Stack, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCallback, useState } from "react";

const Search = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  borderRadius: 50,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
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

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 0, 1, 2),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
    },
  },
}));

const SearchInput = ({
  placeholder,
  onSearchSubmit,
}: {
  placeholder: string;
  onSearchSubmit: (value: string) => void;
}) => {
  const [input, setInput] = useState<string>("");
  const submit = useCallback(
    () => onSearchSubmit(input),
    [input, onSearchSubmit]
  );

  return (
    <Search>
      <StyledInputBase
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && submit()}
      />
      <IconButton onClick={submit}>
        <SearchIcon />
      </IconButton>
    </Search>
  );
};

export default SearchInput;
