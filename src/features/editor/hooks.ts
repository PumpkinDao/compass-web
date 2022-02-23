import { editorSelectors, isLocalScript } from "./slice";
import { useAppSelector } from "../../redux/hooks";
import { useCallback, useEffect } from "react";
import {
  useAddScriptMutation,
  useLazyGetScriptMetaQuery,
  useLazyGetScriptQuery,
  useLazyListScriptsQuery,
  useRunScriptMutation,
  useUpdateScriptMutation,
} from "../../redux/stats-api";
import { walletSelectors } from "../../redux/wallet";

export const useInitialize = () => {
  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const [listScripts] = useLazyListScriptsQuery();

  useEffect(() => {
    if (wallet) {
      listScripts(wallet);
    }
  }, [wallet]);
};

export const useScriptSync = () => {
  const [getScript, { isFetching }] = useLazyGetScriptQuery();
  const script = useAppSelector(editorSelectors.selectedScript);

  useEffect(() => {
    if (script && script.isCodeSynced === false && !isLocalScript(script.id)) {
      getScript(script.id);
    }
  }, [script?.id, script?.isCodeSynced]);

  return isFetching;
};

export const useSaveAction = (): [boolean, VoidFunction] => {
  const [addScript, { fulfilledTimeStamp: addedTime, isLoading: isAdding }] =
    useAddScriptMutation();
  const [
    updateScript,
    { fulfilledTimeStamp: updatedTime, isLoading: isUpdating },
  ] = useUpdateScriptMutation();
  const [getScriptMeta] = useLazyGetScriptMetaQuery();

  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const script = useAppSelector(editorSelectors.selectedScript);

  useEffect(() => {
    if (script && !isLocalScript(script.id)) {
      getScriptMeta(script.id);
    }
  }, [addedTime, updatedTime]);

  return [
    isAdding || isUpdating,
    useCallback(async () => {
      if (!script || !wallet) {
        return;
      }

      const { id, draft } = script;
      if (isLocalScript(id)) {
        addScript({
          owner: wallet,
          code: draft as string,
          localScriptId: id,
        });
      } else {
        updateScript({ scriptId: id, code: draft as string });
      }
    }, [script, wallet]),
  ];
};

export const useRunAction = (): [boolean, VoidFunction] => {
  const script = useAppSelector(editorSelectors.selectedScript);
  const [runScript, { isLoading: isRunning }] = useRunScriptMutation();

  return [
    isRunning,
    useCallback(async () => {
      if (!script || isLocalScript(script.id) || !script.testParamStr) {
        return;
      }

      try {
        const params = JSON.parse(script.testParamStr);
        runScript({ scriptId: script.id, params });
      } catch (e) {
        console.error("Invalid params: ", script.testParamStr);
      }
    }, [script]),
  ];
};
