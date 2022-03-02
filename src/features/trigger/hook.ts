import { useAppSelector } from "../../redux/hooks";
import { walletSelectors } from "../../redux/wallet";
import { useLazyListTriggersQuery } from "../../redux/stats-api";
import { useEffect } from "react";
import { triggerSelectors } from "./slice";
import { useInitialize as useEditorInitialize } from "../editor/hooks";

export const useInitialize = () => {
  useEditorInitialize();

  const wallet = useAppSelector(walletSelectors.connectedAddress);
  const isCreating = useAppSelector(triggerSelectors.isCreating);
  const [listTriggers] = useLazyListTriggersQuery();

  useEffect(() => {
    if (wallet && !isCreating) {
      listTriggers(wallet);
    }
  }, [wallet, isCreating]);
};
