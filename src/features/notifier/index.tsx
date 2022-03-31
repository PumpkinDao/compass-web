import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { walletSelectors } from "../../redux/wallet";
import PendingIcon from "@mui/icons-material/Pending";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Fab,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DraftNotifier,
  Notifier,
  NotifierVariant,
  useAddNotifierMutation,
  useDeleteNotifierMutation,
  useLazyListNotifiersQuery,
} from "../../redux/stats-api";
import moment from "moment";
import DoubleConfirmDelete from "../../components/double-confirm-delete";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import tests from "./notifier-tester";
import { showMessageBar } from "../message-bar/slice";
import { Login } from "../auth";

const TopBar = () => {
  return (
    <AppBar position={"static"}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <div />
        <Typography variant={"h6"} color={"inherit"} noWrap>
          Notifier
        </Typography>
        <Login />
      </Toolbar>
    </AppBar>
  );
};

const Notifier$ = () => {
  const account = useAppSelector(walletSelectors.connectedAccount);
  const [listNotifiers, { data }] = useLazyListNotifiersQuery();

  const notifiers = useMemo(() => {
    return Array.from(data ?? []).sort((a, b) => b.createdAt - a.createdAt);
  }, [data]);

  const [
    addNotifier,
    { fulfilledTimeStamp: addedTimestamp, isLoading: isAdding },
  ] = useAddNotifierMutation();
  const [
    deleteNotifier,
    {
      fulfilledTimeStamp: deletedTimestamp,
      originalArgs: deletingId = -1,
      isLoading: isDeleting,
    },
  ] = useDeleteNotifierMutation();

  useEffect(() => {
    if (account) {
      listNotifiers(account);
    }
  }, [addedTimestamp, deletedTimestamp, account]);

  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <TopBar />
      <Container component="main" maxWidth="sm" sx={{ mb: 4, py: 2 }}>
        <Stack divider={<Box marginBottom={2} />}>
          {notifiers.map((i) => (
            <Item
              key={i.id}
              {...i}
              onDeleteClick={() => deleteNotifier(i.id)}
              isDeleting={isDeleting && deletingId === i.id}
            />
          ))}
        </Stack>
      </Container>
      <Fab
        sx={{ position: "absolute", bottom: 32, right: 32 }}
        color={"primary"}
        disabled={!account}
        onClick={() => setOpenModal(true)}
      >
        <AddIcon />
      </Fab>
      {openModal && (
        <NewNotifierModal
          open={openModal}
          isAdding={isAdding}
          onClose={() => setOpenModal(false)}
          onCancel={() => setOpenModal(false)}
          onConfirm={(v) =>
            addNotifier({ owner: account as string, ...v }).then(() =>
              setOpenModal(false)
            )
          }
        />
      )}
    </>
  );
};

const Item = ({
  name,
  variant,
  createdAt,
  payload,
  onDeleteClick,
  isDeleting,
}: Notifier & { onDeleteClick: VoidFunction; isDeleting: boolean }) => (
  <Card>
    <CardContent>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography color="text.secondary" gutterBottom>
          {variant}
        </Typography>
        {isDeleting ? (
          <IconButton disabled size={"medium"}>
            <PendingIcon />
          </IconButton>
        ) : (
          <DoubleConfirmDelete onClick={onDeleteClick} size={"medium"} />
        )}
      </Stack>
      <Typography variant="h5" component={"div"}>
        {name}
      </Typography>
      <Typography sx={{ mb: 1.5 }} color={"text.secondary"}>
        {moment(createdAt).fromNow()}
      </Typography>
      <Typography variant={"body2"} noWrap={true} sx={{ marginRight: "64px" }}>
        {payload}
      </Typography>
    </CardContent>
  </Card>
);

const AllNotifierVariant = ["slack", "webhook"];

const isValidHttpUrl = (urlStr: string) => {
  let url;

  try {
    url = new URL(urlStr);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

const NewNotifierModal = ({
  open,
  onClose,
  onCancel,
  isAdding,
  onConfirm,
}: {
  open: boolean;
  isAdding: boolean;
  onClose: VoidFunction;
  onCancel: VoidFunction;
  onConfirm: (notifier: Omit<DraftNotifier, "owner">) => void;
}) => {
  const [variant, setVariant] = useState<NotifierVariant>("slack");
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  const [disableConfirmBtn, onConfirmInner] = useMemo(() => {
    if (variant && name && isValidHttpUrl(url)) {
      return [
        false,
        () =>
          onConfirm({
            name,
            payload: url,
            variant,
          }),
      ];
    }
    return [true, undefined];
  }, [onConfirm, variant, name, url]);
  const dispatch = useAppDispatch();

  const onTestClick = useCallback(async () => {
    try {
      url &&
        variant &&
        (await tests[variant](
          url,
          `Hi friend, now the time is ${moment().format()}`
        ));
      dispatch(
        showMessageBar({ severity: "success", message: "Test Success" })
      );
    } catch (e) {
      dispatch(
        showMessageBar({
          severity: "error",
          message: `Test Failed. error: ${e.message}`,
        })
      );
    }
  }, [variant, url]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Notifier</DialogTitle>
      <Stack sx={{ margin: "16px", minWidth: "300px" }}>
        <FormControl size={"small"}>
          <InputLabel>type</InputLabel>
          <Select
            label={"type"}
            value={variant}
            onChange={(e) => setVariant(e.target.value as NotifierVariant)}
          >
            {AllNotifierVariant.map((i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box marginBottom={"16px"} />
        <TextField
          label={"name"}
          size={"small"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Box marginBottom={"16px"} />
        <TextField
          label={"Url"}
          multiline
          maxRows={3}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Link
          component={"button"}
          sx={{ alignSelf: "flex-end" }}
          onClick={onTestClick}
        >
          test
        </Link>
      </Stack>

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
    </Dialog>
  );
};

export default Notifier$;
