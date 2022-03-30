import { useAppSelector } from "../../redux/hooks";
import { walletSelectors } from "../../redux/wallet";
import { useLazyListTriggersQuery } from "../../redux/stats-api";
import { useEffect } from "react";
import { triggerSelectors } from "./slice";
import { useInitialize as useEditorInitialize } from "../editor/hooks";

export const useInitialize = () => {
  useEditorInitialize();

  const account = useAppSelector(walletSelectors.connectedAccount);
  const isCreating = useAppSelector(triggerSelectors.isCreating);
  const [listTriggers] = useLazyListTriggersQuery();

  useEffect(() => {
    if (account && !isCreating) {
      listTriggers(account);
    }
  }, [account, isCreating]);
};
