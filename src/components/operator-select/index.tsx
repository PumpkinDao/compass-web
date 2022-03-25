import { Box, Button, Popover, Stack, TextField } from "@mui/material";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { OP } from "../../redux/stats-api";

const StrInput = ({
  onValueChanged,
}: {
  onValueChanged: (value: string) => void;
}) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    onValueChanged(value);
  }, [value]);

  return (
    <TextField
      fullWidth
      size={"small"}
      variant={"standard"}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

const NumInput = ({
  initialVal,
  onValueChanged,
  error,
}: {
  initialVal?: number | undefined;
  onValueChanged: (value: string) => void;
  error?: boolean;
}) => {
  const [value, setValue] = useState<string>(
    typeof initialVal === "number" ? String(initialVal) : "0"
  );
  const isValueError =
    useMemo(() => {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        return true;
      }
      onValueChanged(String(num));
      return false;
    }, [value, error, onValueChanged]) || error;

  return (
    <TextField
      fullWidth
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
      size={"small"}
      variant={"standard"}
      value={value}
      error={isValueError}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

const RangeInput = ({
  onValueChanged,
}: {
  onValueChanged: (value: string) => void;
}) => {
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(1);

  const isValueError = useMemo(() => {
    if (min >= max) {
      return true;
    }
    onValueChanged(`${min},${max}`);
    return false;
  }, [min, max, onValueChanged]);

  return (
    <Stack
      direction={"row"}
      alignItems={"flex-end"}
      divider={<Box sx={{ marginLeft: "3px" }} />}
    >
      <NumInput
        onValueChanged={(v) => setMin(Number(v))}
        error={isValueError}
      />
      ,
      <NumInput
        initialVal={1}
        onValueChanged={(v) => setMax(Number(v))}
        error={isValueError}
      />
    </Stack>
  );
};

export const ops: Record<
  OP,
  {
    indicator: ReactNode;
    input: (props: {
      onValueChanged: (value: string) => void;
    }) => JSX.Element | null;
  }
> = {
  eq: {
    indicator: "==",
    input: StrInput,
  },
  nq: {
    indicator: "!=",
    input: StrInput,
  },
  lt: {
    indicator: "<",
    input: NumInput,
  },
  gt: {
    indicator: ">",
    input: NumInput,
  },
  lte: {
    indicator: "<=",
    input: NumInput,
  },
  gte: {
    indicator: ">=",
    input: NumInput,
  },
  range: {
    indicator: "range",
    input: RangeInput,
  },
  exist: {
    indicator: "existing",
    input: () => null,
  },
  error: {
    indicator: "error",
    input: () => null,
  },
};

const Op = ({
  indicator,
  onClick,
}: {
  indicator: ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <Button color={"inherit"} sx={{ textTransform: "none" }} onClick={onClick}>
      {indicator}
    </Button>
  );
};

const OperatorSelect = ({
  op: defaultOp,
  onOpChanged,
  onValueChanged,
}: {
  op?: OP;
  onOpChanged: (op: OP) => void;
  onValueChanged: (value: string) => void;
}) => {
  const [op, setOp] = useState<OP>(defaultOp || "eq");
  const { indicator, input: Input } = ops[op];

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const handleOpClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );
  const handleOpClose = useCallback(() => setAnchorEl(null), []);
  const handlePopoverItemClick = useCallback(
    (operator: OP) => {
      setOp(operator);
      setAnchorEl(null);
    },
    [onOpChanged]
  );

  useEffect(() => {
    onOpChanged && onOpChanged(op);
  }, [op]);

  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      divider={<Box sx={{ marginLeft: "8px" }} />}
      sx={{
        height: "50px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Op indicator={indicator} onClick={handleOpClick} />
      <Input key={op} onValueChanged={onValueChanged} />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleOpClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: "200px",
            display: "flex",
            flexWrap: "wrap",
          },
        }}
      >
        {Object.entries(ops).map(([operator, { indicator }]) => (
          <Button
            color={"inherit"}
            sx={{ flex: 1, textTransform: "none" }}
            key={operator}
            onClick={() => handlePopoverItemClick(operator as OP)}
          >
            {indicator}
          </Button>
        ))}
      </Popover>
    </Stack>
  );
};

export default OperatorSelect;
