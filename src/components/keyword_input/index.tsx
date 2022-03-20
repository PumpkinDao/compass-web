import { useMemo, useState } from "react";
import { TextField } from "@mui/material";

const KEYWORD_PATTERN = /^\w+(\.\w+)*$/;

const KeywordInput = ({
  onValueChanged,
}: {
  onValueChanged: (value: string) => void;
}) => {
  const [value, setValue] = useState<string>("");

  const isValueError = useMemo(() => {
    if (value && !KEYWORD_PATTERN.test(value)) {
      return true;
    }

    onValueChanged(value);
    return false;
  }, [value, onValueChanged]);

  return (
    <TextField
      sx={{ width: "120px", "& .MuiInput-input": { textAlign: "center" } }}
      size={"small"}
      variant={"standard"}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={"value"}
      error={isValueError}
    />
  );
};

export default KeywordInput;
