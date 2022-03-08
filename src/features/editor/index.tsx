import LoadingButton from "@mui/lab/LoadingButton";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SplitPane from "../../components/split-pane";
import { useMemo, useState } from "react";
import MonacoEditor from "../../components/monaco-editor";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { editorActions, editorSelectors, isLocalScript } from "./slice";
import { walletSelectors } from "../../redux/wallet";
import {
  useInitialize,
  useRunAction,
  useSaveAction,
  useScriptSync,
} from "./hooks";
import { useWeb3ReactActivate } from "../../redux/wallet/hooks";
import { useDeleteScriptMutation } from "../../redux/stats-api";
import DoubleConfirmDelete from "../../components/double-confirm-delete";

const EditorTopBar = () => {
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const isScriptSyncing = useScriptSync();
  const activeWeb3 = useWeb3ReactActivate();

  return (
    <AppBar position={"static"}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <div />
        <Typography variant={"h6"} color={"inherit"} noWrap>
          Editor
        </Typography>
        <Button
          variant={"contained"}
          disabled={!!wallet}
          onClick={() => activeWeb3()}
        >
          {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-6)}` : "Connect"}
        </Button>
      </Toolbar>
      {isScriptSyncing && (
        <Box>
          <LinearProgress sx={{ marginTop: -0.5 }} />
        </Box>
      )}
    </AppBar>
  );
};

const ScriptList = () => {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const scripts = useAppSelector(editorSelectors.allScripts);
  const selectedId = useAppSelector(editorSelectors.selectedScriptId);

  const [deleteScript, { isLoading: isDeleting, originalArgs: deletingId }] =
    useDeleteScriptMutation();

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
          Scripts
        </Typography>

        <IconButton
          disabled={!wallet}
          onClick={() => dispatch(editorActions.create())}
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
        {scripts.map((i) => (
          <ListItem
            key={i.id}
            disablePadding
            selected={selectedId === i.id}
            secondaryAction={
              isDeleting && i.id === deletingId ? (
                <CircularProgress color={"inherit"} size={24} />
              ) : (
                <DoubleConfirmDelete
                  onClick={() =>
                    isLocalScript(i.id)
                      ? dispatch(editorActions.deleteLocal(i.id))
                      : deleteScript(i.id)
                  }
                />
              )
            }
          >
            <ListItemButton
              onClick={() => dispatch(editorActions.select(i.id))}
            >
              <ListItemText sx={{ paddingLeft: "16px" }}>{i.name}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const ScriptEditor = () => {
  const dispatch = useAppDispatch();
  const script = useAppSelector(editorSelectors.selectedScript);

  return script ? (
    <MonacoEditor
      language={"typescript"}
      value={script.draft || script.code}
      onChange={(value) =>
        dispatch(
          editorActions.draftScriptCode({
            id: script.id,
            draft: value || "",
          })
        )
      }
    />
  ) : null; // todo null view
};

const ScriptViewer = () => {
  const [value, setValue] = useState("metadata");
  return (
    <Stack
      sx={{
        height: "100%",
        background: "rgb(33, 33, 33)",
        overflow: "auto",
      }}
    >
      <Tabs
        variant={"fullWidth"}
        value={value}
        onChange={(_, v) => setValue(v)}
      >
        <Tab label={"metadata"} value={"metadata"} />
        <Tab label={"test"} value={"test"} />
      </Tabs>

      <Box sx={{ flex: 1 }}>
        {value === "metadata" && <MetaDataBlock />}
        {value === "test" && <RunBlock />}
      </Box>

      <Stack
        direction={"row-reverse"}
        sx={{
          padding: "16px",
          background: "rgb(47, 47, 47)",
        }}
      >
        <MainActionBlock />
      </Stack>
    </Stack>
  );
};

const MainActionBlock = () => {
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const script = useAppSelector(editorSelectors.selectedScript);
  const isOnlyLocalScript = useMemo(
    () => script && script.id.startsWith("local"),
    [script?.id]
  );
  const hasDraftCode = useMemo(
    () => script && script.draft && script.draft !== script.code,
    [script?.draft]
  );
  const params = useMemo(() => {
    if (script?.testParamStr) {
      try {
        return JSON.parse(script.testParamStr) as Record<string, unknown>;
      } catch (e) {
        // ignored
      }
    }
  }, [script?.testParamStr]);

  const saveBtnEnabled = isOnlyLocalScript || hasDraftCode;
  const runBtnEnabled =
    !!wallet && !isOnlyLocalScript && typeof params === "object";

  const [isSaving, saveAction] = useSaveAction();
  const [isRunning, runAction] = useRunAction();

  return (
    <Stack direction={"row"}>
      <LoadingButton
        variant={"contained"}
        sx={{ marginRight: "16px" }}
        loading={isSaving}
        disabled={!saveBtnEnabled}
        onClick={saveAction}
      >
        Save
      </LoadingButton>
      <LoadingButton
        variant={"contained"}
        color={"secondary"}
        loading={isSaving || isRunning}
        disabled={!saveBtnEnabled || !runBtnEnabled}
        onClick={() =>
          Promise.resolve(hasDraftCode ? saveAction() : undefined).then(
            runAction
          )
        }
      >
        Run
      </LoadingButton>
    </Stack>
  );
};

const MetaDataBlock = () => {
  const script = useAppSelector(editorSelectors.selectedScript);
  const { name, description, tag } = script?.meta || {
    name: "",
    description: "",
    tag: "",
  };

  return (
    <Box sx={{ padding: "16px" }}>
      <MetaDataItem label={"Name"} value={name} />
      <Box sx={{ marginTop: "16px" }} />
      <MetaDataItem label={"Description"} value={description} />
      <Box sx={{ marginTop: "16px" }} />
      <MetaDataItem label={"Tags"} value={tag} />
    </Box>
  );
};

const MetaDataItem = ({ label, value }: { label: string; value: string }) => (
  <>
    <Typography
      sx={{
        fontSize: "12px",
        color: "rgb(123, 123, 123)",
        marginBottom: "8px",
      }}
    >
      {label}
    </Typography>
    {value ? (
      <Typography>{value}</Typography>
    ) : (
      <Typography sx={{ fontStyle: "italic" }}>{"<empty>"}</Typography>
    )}
  </>
);

const RunBlock = () => {
  const dispatch = useAppDispatch();
  const script = useAppSelector(editorSelectors.selectedScript);

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography
        sx={{
          fontSize: "12px",
          color: "rgb(123, 123, 123)",
          marginBottom: "16px",
        }}
      >
        Params
      </Typography>
      <MonacoEditor
        onChange={(value) =>
          script &&
          dispatch(
            editorActions.inputParams({
              id: script.id,
              testParamStr: value || "",
            })
          )
        }
        value={script?.testParamStr || "{}"}
        height={300}
        language={"json"}
        options={{
          lineNumbers: "off",
          minimap: { enabled: false },
        }}
      />
      <Typography
        sx={{
          fontSize: "12px",
          color: "rgb(123, 123, 123)",
          marginTop: "32px",
          marginBottom: "16px",
        }}
      >
        Result
      </Typography>
      <Box>
        <TextField
          sx={{ overflow: "auto" }}
          multiline
          fullWidth
          maxRows={5}
          disabled
          value={script?.testResult}
        />
      </Box>
    </Box>
  );
};

const Editor = () => {
  useInitialize();

  return (
    <>
      <Box sx={{ justifyContent: "space-between" }}>
        <EditorTopBar />
        <SplitPane
          allowResize
          split={"vertical"}
          minSize={"10%"}
          defaultSize="15%"
        >
          <ScriptList />
          <SplitPane
            allowResize
            split={"vertical"}
            minSize={"20%"}
            defaultSize="70%"
          >
            <ScriptEditor />
            <ScriptViewer />
          </SplitPane>
        </SplitPane>
      </Box>
    </>
  );
};

export default Editor;
