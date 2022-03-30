import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import KeywordInput from "../../components/keyword_input";
import OperatorSelect from "../../components/operator-select";
import {
  DraftStatement,
  OP,
  useListNotifiersQuery,
} from "../../redux/stats-api";
import { useAppSelector } from "../../redux/hooks";
import { walletSelectors } from "../../redux/wallet";
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate } from "react-router-dom";

const MINUTE_TO_MILLISECOND = 60 * 1000;

const ThrottleInput = ({
  onValueChanged,
}: {
  onValueChanged: (value: number) => void;
}) => {
  const [value, setValue] = useState("0.5");

  const isValueError = useMemo(() => {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0.5 && num <= 20000) {
      onValueChanged(Math.floor(num * MINUTE_TO_MILLISECOND));
      return false;
    }

    return true;
  }, [value, onValueChanged]);

  return (
    <Input
      sx={{
        width: "120px",
        "& .MuiInput-input": {
          textAlign: "center",
        },
      }}
      value={value}
      error={isValueError}
      onChange={(e) => setValue(e.target.value)}
      endAdornment={<InputAdornment position="end">minute(s)</InputAdornment>}
    />
  );
};

const NotifierSelect = ({
  onValueChanged,
}: {
  onValueChanged: (id: number) => void;
}) => {
  const account = useAppSelector(walletSelectors.connectedAccount);
  const { data: notifiers } = useListNotifiersQuery(account as string);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      typeof selectedId === "number" &&
      Number.isFinite(selectedId) &&
      selectedId > 0
    ) {
      onValueChanged && onValueChanged(selectedId);
    }
  }, [onValueChanged, selectedId]);

  return (
    <FormControl size={"small"}>
      <InputLabel>notifier</InputLabel>
      <Select
        sx={{ width: "120px" }}
        label={"notifier"}
        value={selectedId}
        onChange={(e) => setSelectedId(Number(e.target.value))}
      >
        <MenuItem
          key={"new"}
          value={"new"}
          onClick={() => navigate("/notifier")}
        >
          <Typography sx={{ textDecoration: "underline", fontStyle: "italic" }}>
            New
          </Typography>
        </MenuItem>
        {(notifiers || []).map(({ id, name }) => (
          <MenuItem key={id} value={String(id)}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const NewStatementModal = ({
  open,
  onClose,
  onCancel,
  onConfirm,
  isAdding,
}: {
  open: boolean;
  isAdding: boolean;
  onClose: VoidFunction;
  onCancel: VoidFunction;
  onConfirm: (value: Omit<DraftStatement, "triggerId">) => void;
}) => {
  const [keyword, setKeyword] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [expect, setExpect] = useState<string>("");
  const [notifierId, setNotifierId] = useState<number | undefined>();
  const [notifyMsg, setNotifyMsg] = useState<string>("");
  const [throttleTimeout, setThrottleTimeout] = useState<number>(0);

  const [disableConfirmBtn, onConfirmInner] = useMemo(() => {
    if (operator && notifierId && notifyMsg) {
      return [
        false,
        () =>
          onConfirm({
            keyword,
            operator: operator as OP,
            expect,
            notifierId,
            notifyMsg,
            throttleTimeout,
          }),
      ];
    }

    return [true, undefined];
  }, [
    onConfirm,
    keyword,
    operator,
    expect,
    notifierId,
    notifyMsg,
    throttleTimeout,
  ]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Statement</DialogTitle>
      <DialogContent sx={{ minWidth: "400px" }}>
        <Row>
          <Typography>If</Typography>
          {operator !== "error" ? (
            <KeywordInput onValueChanged={setKeyword} />
          ) : null}
          <OperatorSelect
            onOpChanged={(op) => {
              expect && setExpect("");
              setOperator(op);
            }}
            onValueChanged={setExpect}
          />
        </Row>
        <Box marginTop={"16px"} />
        <Row>
          <Typography>then</Typography>
          <Typography>notify</Typography>

          <NotifierSelect onValueChanged={setNotifierId} />
        </Row>
        <Box marginTop={"16px"} />
        <Row>
          <Typography>with</Typography>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={notifyMsg}
            onChange={(e) => setNotifyMsg(e.target.value)}
          />
        </Row>
        <Box marginTop={"32px"} />
        <Row>
          <Typography>in every</Typography>
          <ThrottleInput onValueChanged={setThrottleTimeout} />
        </Row>
        <DialogActions>
          <Button color={"inherit"} onClick={onCancel}>
            Cancel
          </Button>
          <LoadingButton
            loading={isAdding}
            color={"primary"}
            onClick={onConfirmInner}
            disabled={disableConfirmBtn}
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ children }: { children?: React.ReactNode }) => (
  <Stack
    direction={"row"}
    alignItems={"center"}
    divider={<Box marginLeft={"8px"} />}
  >
    {children}
  </Stack>
);

export default NewStatementModal;
