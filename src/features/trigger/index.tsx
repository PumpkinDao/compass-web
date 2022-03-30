import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SplitPane from "../../components/split-pane";
import { useInitialize } from "./hook";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { walletSelectors } from "../../redux/wallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { triggerActions, triggerSelectors } from "./slice";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { editorSelectors } from "../editor/slice";
import {
  Trigger,
  useAddStatementMutation,
  useAddTriggerMutation,
  useDeleteStatementMutation,
  useDeleteTriggerMutation,
  useLazyListStatementsQuery,
  useListTriggerActivitiesQuery,
} from "../../redux/stats-api";
import MonacoEditor from "../../components/monaco-editor";
import LoadingButton from "@mui/lab/LoadingButton";

import moment from "moment";
import DoubleConfirmDelete from "../../components/double-confirm-delete";
import NewStatementModal from "../new-statement-modal";
import StatementList from "../../components/statement-list";
import StatementResultList from "../../components/statement-result-list";
import { useWeb3Activate } from "../web3-root/hooks";

const TriggerTopBar = () => {
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const activeWeb3 = useWeb3Activate();

  return (
    <AppBar position={"static"}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <div />
        <Typography variant={"h6"} color={"inherit"} noWrap>
          Trigger
        </Typography>
        <Button
          variant={"contained"}
          disabled={!!wallet}
          onClick={() => activeWeb3()}
        >
          {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-6)}` : "Connect"}
        </Button>
      </Toolbar>
      <TopProgress />
    </AppBar>
  );
};

const TopProgress = () => {
  const isCreating = useAppSelector(triggerSelectors.isCreating);
  const selectedId = useAppSelector(triggerSelectors.selectedTriggerId);

  return !isCreating && selectedId ? (
    <Box key={selectedId} sx={{ marginTop: -0.5 }}>
      <IntervalProgress interval={60} />
    </Box>
  ) : null;
};

const IntervalProgress = ({ interval }: { interval: number }) => {
  const maxRange = 100;
  const step = interval / maxRange;
  const [progress, setProgress] = useState(maxRange);

  useEffect(() => {
    const timer = setInterval(
      () => setProgress((prev) => (prev <= 0 ? maxRange : prev - step)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  return <LinearProgress variant={"determinate"} value={progress} />;
};

const TriggerList = () => {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const triggers = useAppSelector(triggerSelectors.allTriggers);
  const selectedId = useAppSelector(triggerSelectors.selectedTriggerId);
  const [deleteTrigger, { isLoading: isDeleting, originalArgs: deletingId }] =
    useDeleteTriggerMutation();

  return (
    <Box sx={{ overflow: "auto" }}>
      <Stack
        direction={"row"}
        sx={{ justifyContent: "space-between", alignContent: "center" }}
      >
        <Typography
          noWrap
          component="div"
          sx={{
            color: "rgb(107, 107, 107)",
            padding: "8px 24px 8px 24px",
          }}
        >
          Triggers
        </Typography>

        <IconButton
          disabled={!wallet}
          onClick={() => dispatch(triggerActions.enterCreating())}
        >
          <AddCircleIcon fontSize={"small"} sx={{ color: "rgb(51, 51, 51)" }} />
        </IconButton>
      </Stack>
      <List
        sx={{
          borderRightWidth: "1px",
          borderRightColor: "white",
          overflow: "auto",
        }}
      >
        {triggers.map((i) => (
          <ListItem
            key={i.id}
            disablePadding
            selected={selectedId === i.id}
            secondaryAction={
              isDeleting && i.id === deletingId ? (
                <CircularProgress color={"inherit"} size={24} />
              ) : (
                <DoubleConfirmDelete onClick={() => deleteTrigger(i.id)} />
              )
            }
          >
            <ListItemButton
              onClick={() => dispatch(triggerActions.select(i.id))}
            >
              <ListItemText sx={{ paddingLeft: "16px" }}>{i.name}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const TriggerViewer = () => {
  const isCreating = useAppSelector(triggerSelectors.isCreating);
  const selectedId = useAppSelector(triggerSelectors.selectedTriggerId);
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        background: "#1e1e1e",
      }}
    >
      {isCreating ? (
        <TriggerCreating />
      ) : typeof selectedId === "number" ? (
        <SplitPane
          allowResize
          split={"vertical"}
          minSize={"30%"}
          defaultSize="70%"
        >
          <TriggerActivities />
          <TriggerDetail />
        </SplitPane>
      ) : null}
    </Box>
  );
};

const TriggerCreating = () => {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const [addTrigger, { isLoading: isAddingTrigger }] = useAddTriggerMutation();
  const [draft, setDraft] = useState<
    Partial<Pick<Trigger, "name" | "scriptId" | "params">>
  >({ params: "{}" });

  const scripts = useAppSelector(editorSelectors.allScripts);
  const isDraftReady = useMemo(() => {
    const { name, scriptId, params } = draft;

    if (typeof name !== "string" || !name) {
      return false;
    } else if (
      typeof scriptId !== "string" ||
      scripts.findIndex((i) => i.id === scriptId) < 0
    ) {
      return false;
    } else {
      try {
        const obj = JSON.parse(params as string);
        if (typeof obj !== "object") {
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    return true;
  }, [draft, scripts]);

  useEffect(() => {
    if (!draft?.scriptId || !scripts || scripts.length <= 0) {
      return;
    }

    const script = scripts.find((i) => i.id === draft.scriptId);
    if (!script) {
      return;
    }

    const args = script.meta.args || "";

    setDraft((prev) => ({
      ...prev,
      params: JSON.stringify(
        args
          ? Object.fromEntries(args.split(",").map((name) => [name, null]))
          : {},
        undefined,
        2
      ),
    }));
  }, [draft?.scriptId, scripts]);

  return (
    <Stack
      direction={"column"}
      sx={{
        width: "60%",
        height: "600px",
        padding: "32px",
        background: "#121212",
        borderRadius: "8px",
      }}
    >
      <TextField
        sx={{ marginBottom: "16px" }}
        label={"Name"}
        placeholder={"Please enter trigger name"}
        value={draft?.name || ""}
        onChange={(event) =>
          setDraft((prev) => ({ ...prev, name: event.target.value }))
        }
      />

      <FormControl fullWidth sx={{ marginBottom: "16px" }}>
        <InputLabel>Script</InputLabel>
        <Select
          value={draft?.scriptId || ""}
          label="Age"
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, scriptId: event.target.value }))
          }
        >
          {scripts.map((i) => (
            <MenuItem key={i.id} value={i.id}>
              {i.meta.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <MonacoEditor
        onChange={(value) => setDraft((prev) => ({ ...prev, params: value }))}
        value={draft?.params}
        height={300}
        language={"json"}
        options={{
          lineNumbers: "off",
          minimap: { enabled: false },
        }}
      />

      <Stack
        sx={{ alignSelf: "flex-end", marginTop: "16px" }}
        direction={"row"}
      >
        <Button
          color={"secondary"}
          sx={{ marginRight: "16px" }}
          onClick={() => dispatch(triggerActions.exitCreating())}
        >
          Cancel
        </Button>

        <LoadingButton
          disabled={!isDraftReady}
          loading={isAddingTrigger}
          onClick={() => addTrigger({ ...draft, owner: wallet } as never)}
          variant={"contained"}
        >
          Create
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

const TriggerDetail = () => {
  const scripts = useAppSelector(editorSelectors.allScripts);
  const trigger = useAppSelector(triggerSelectors.selectedTrigger);
  const script = useMemo(() => {
    return trigger?.scriptId
      ? scripts.find((i) => i.id === trigger.scriptId)
      : undefined;
  }, [trigger?.scriptId, scripts]);
  const lastRunTime = useMemo(() => {
    return trigger?.lastRunTime && moment(trigger.lastRunTime).fromNow();
  }, [trigger?.lastRunTime]);

  const [listStatements, { data: statements = [] }] =
    useLazyListStatementsQuery();
  const [openModal, setOpenModal] = useState(false);
  const [
    addStatement,
    { isLoading: isAdding, fulfilledTimeStamp: addedTimestamp },
  ] = useAddStatementMutation();
  const [
    deleteStatement,
    { fulfilledTimeStamp: deletedTimestamp, originalArgs: deletingId = -1 },
  ] = useDeleteStatementMutation();

  useEffect(() => {
    if (typeof trigger?.id === "number") {
      listStatements(trigger.id);
    }
  }, [trigger?.id, addedTimestamp, deletedTimestamp]);

  return (
    <Stack direction={"column"}>
      <Typography
        sx={{
          marginTop: "16px",
          marginLeft: "16px",
          marginBottom: "16px",
        }}
        color={script ? "inherit" : "error"}
      >
        {script?.meta.name ?? "Script Not Found"}
      </Typography>

      <MonacoEditor
        value={trigger?.params}
        height={300}
        language={"json"}
        options={{
          lineNumbers: "off",
          minimap: { enabled: false },
        }}
      />
      <Typography
        fontSize={12}
        sx={{
          alignSelf: "flex-end",
          marginTop: "16px",
          marginRight: "16px",
        }}
      >
        Run At: {lastRunTime || "-s"}
      </Typography>

      <Box marginTop={"32px"} />

      <StatementList
        statements={statements}
        onDeleteStatementClick={(id) => deleteStatement(id)}
        deletingId={deletingId}
        onNewStatementClick={() => setOpenModal(true)}
      />

      {openModal && (
        <NewStatementModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCancel={() => setOpenModal(false)}
          onConfirm={(v) =>
            addStatement({ ...v, triggerId: trigger?.id as number }).then(() =>
              setOpenModal(false)
            )
          }
          isAdding={isAdding}
        />
      )}
    </Stack>
  );
};

const TriggerActivities = () => {
  const selectedId = useAppSelector(triggerSelectors.selectedTriggerId);
  const { data } = useListTriggerActivitiesQuery(selectedId as number, {
    pollingInterval: 60000,
  });

  const activities = useMemo(() => {
    return (data || []).map((i) => {
      const timeUsed = parseInt((i.timeUsed / 1000) as never);

      let value, status;
      try {
        const result = JSON.parse(i.result);
        status = result.status;
        value = JSON.stringify(result?.value || result?.reason, undefined, 2);
      } catch (e) {
        status = "rejected";
        value = e.toString();
      }

      return {
        id: i.id,
        createdAt: moment(i.createdAt).fromNow(),
        status,
        value,
        timeUsed: timeUsed <= 0 ? `Less than 1s` : `${timeUsed}s`,
        statementResults: i.statementResults,
      };
    });
  }, [data]);

  return (
    <Box
      sx={{
        overflowY: "scroll",
        height: "100%",
        paddingLeft: "10%",
        paddingRight: "10%",
        paddingTop: "16px",
        paddingBottom: "16px",
      }}
    >
      {activities.map((i) => (
        <Card
          key={i.id}
          variant={"elevation"}
          sx={{
            background: "#121212",
            marginBottom: "16px",
            borderRadius: "8px",
          }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ marginBottom: "6px" }}>{i.createdAt}</Typography>
            <TextField
              multiline
              fullWidth
              maxRows={5}
              value={i.value}
              error={i.status === "rejected"}
            />
            <Typography
              fontSize={12}
              sx={{ alignSelf: "flex-end", marginTop: "6px" }}
            >
              {i.timeUsed}
            </Typography>

            <StatementResultList statementResults={i.statementResults} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export const TriggerBlock = () => {
  useInitialize();

  return (
    <Box sx={{ justifyContent: "space-between" }}>
      <TriggerTopBar />
      <SplitPane
        allowResize
        split={"vertical"}
        minSize={"10%"}
        defaultSize="15%"
      >
        <TriggerList />
        <TriggerViewer />
      </SplitPane>
    </Box>
  );
};

export default TriggerBlock;
