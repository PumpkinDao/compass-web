import { v4 as uuidv4 } from "uuid";
import {
  createSelector,
  createSlice,
  Draft,
  PayloadAction,
} from "@reduxjs/toolkit";
import { createSliceSelector } from "../../redux/utils";
import { Script, statEndpoints } from "../../redux/stats-api";

export const NAMESPACE = "editor";

export type DraftScript = Script & {
  draft?: string;
  testParamStr?: string;
  testResult?: string;
  isCodeSynced?: boolean;
};

type EditorState = {
  scripts: Record<string, DraftScript>;
  selectedId: string;
};

export const LOCAL_SCRIPT_ID_PREFIX = "local_";

const DemoScript: Partial<DraftScript> = {
  code: "",
  draft: `
export const name = 'Sample Script';
export const description = 'Get the balance of address';
export const tag = 'sample balance';

export const run = async ({ address }: { address: string }) => {
  const provider = evm.getProvider('ethereum');
  const balance = await provider.getBalance(address);

  return {
    address,
    balance: balance.toString(),
  };
};
`,
  meta: {
    name: "Sample Script",
    description: "Get the balance of address",
    tag: "sample balance",
    updatedAt: 0,
    args: "",
  },
  testParamStr: "{}",
};

const newDemoScript = (): Script =>
  ({
    ...DemoScript,
    id: LOCAL_SCRIPT_ID_PREFIX + uuidv4().split("-")[0],
    meta: {
      ...DemoScript.meta,
      updatedAt: Date.now(),
    },
  } as Script);

export const isLocalScript = (id: string): boolean =>
  id.startsWith(LOCAL_SCRIPT_ID_PREFIX);

const initialState: EditorState = {
  scripts: {},
  selectedId: "",
};

const slice = createSlice({
  name: NAMESPACE,
  initialState,
  reducers: {
    create: (state) => {
      const script = newDemoScript();
      state.scripts[script.id] = script;
      state.selectedId = script.id;
    },
    select: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
    deleteLocal: (state, action: PayloadAction<string>) => {
      const scriptId = action.payload;
      if (isLocalScript(scriptId)) {
        deleteScriptAndUpdateState(scriptId, state);
      }
    },
    draftScriptCode: (
      state,
      action: PayloadAction<{ id: string; draft: string }>
    ) => {
      const { id, draft } = action.payload;
      state.scripts[id].draft = draft;
      state.scripts[id].meta.updatedAt = Date.now();
    },
    inputParams: (
      state,
      action: PayloadAction<{ id: string; testParamStr: string }>
    ) => {
      const { id, testParamStr } = action.payload;
      state.scripts[id].testParamStr = testParamStr;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(statEndpoints.addScript.matchFulfilled, (state, action) => {
        const { scriptId: originScriptId } = action.payload;
        const {
          arg: {
            originalArgs: { localScriptId, code },
          },
        } = action.meta;

        const script = state.scripts[localScriptId];

        if (!script) {
          return;
        }

        state.scripts[originScriptId] = {
          ...script,
          id: originScriptId,
          draft: undefined,
          code,
        };
        delete state.scripts[localScriptId];

        state.selectedId === localScriptId &&
          (state.selectedId = originScriptId);
      })
      .addMatcher(
        statEndpoints.updateScript.matchFulfilled,
        (state, action) => {
          const { scriptId } = action.payload;
          const {
            arg: {
              originalArgs: { code },
            },
          } = action.meta;

          const script = state.scripts[scriptId];
          script &&
            (state.scripts[scriptId] = {
              ...script,
              code,
              draft: undefined,
            });
        }
      )
      .addMatcher(statEndpoints.runScript.matchFulfilled, (state, action) => {
        const { timeUsed, result } = action.payload;
        const {
          arg: {
            originalArgs: { scriptId },
          },
        } = action.meta;
        console.log(`Script<${scriptId}> timeUsed: `, timeUsed);

        const script = state.scripts[scriptId];
        script && (script.testResult = JSON.stringify(result, undefined, 2));
      })
      .addMatcher(
        statEndpoints.getScriptMeta.matchFulfilled,
        (state, action) => {
          const { scriptId, ...meta } = action.payload;

          const script = state.scripts[scriptId];
          script &&
            (script.meta = {
              ...script.meta,
              ...meta,
            });
        }
      )
      .addMatcher(statEndpoints.listScripts.matchFulfilled, (state, action) => {
        const scripts = Array.from(action.payload).sort(descScripts);

        state.scripts = scripts.reduce<Record<string, DraftScript>>(
          (acc, cur) => {
            acc[cur.id] = {
              ...cur,
              code: "",
              testParamStr: "{}",
              isCodeSynced: false,
            };
            return acc;
          },
          {}
        );
        state.selectedId = scripts && scripts.length > 0 ? scripts[0].id : "";
      })
      .addMatcher(statEndpoints.getScript.matchFulfilled, (state, action) => {
        const { id, code } = action.payload;
        state.scripts[id] &&
          (state.scripts[id] = {
            ...state.scripts[id],
            code,
            isCodeSynced: true,
          });
      })
      .addMatcher(
        statEndpoints.deleteScript.matchFulfilled,
        (state, action) => {
          const {
            arg: { originalArgs: scriptId },
          } = action.meta;

          deleteScriptAndUpdateState(scriptId, state);
        }
      );
  },
});

const deleteScriptAndUpdateState = (
  scriptId: string,
  state: Draft<EditorState>
) => {
  let scriptList = Object.values(state.scripts).sort(descScripts);
  delete state.scripts[scriptId];

  if (state.selectedId === scriptId) {
    const index = scriptList.findIndex((i) => i.id === scriptId);
    scriptList = scriptList.filter((i) => i.id !== scriptId);

    state.selectedId =
      scriptList.length > index ? scriptList[index].id : scriptList[0]?.id;
  }
};

export const { reducer } = slice;
export const editorActions = slice.actions;

const sliceSelector = createSliceSelector(NAMESPACE);

const allScripts = createSelector(
  sliceSelector,
  (state) => Object.values(state.scripts).sort(descScripts)
  // .map((i) => ({ id: i.id, name: i.meta.name }))
);

const descScripts = (a: Pick<Script, "meta">, b: Pick<Script, "meta">) =>
  b.meta.updatedAt - a.meta.updatedAt;

const selectedScriptId = createSelector(
  sliceSelector,
  (state) => state.selectedId
);

const selectedScript = createSelector(
  [sliceSelector, selectedScriptId],
  (state, selectedId) => state.scripts[selectedId]
);

export const editorSelectors = {
  allScripts,
  selectedScriptId,
  selectedScript,
};
