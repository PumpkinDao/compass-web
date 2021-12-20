import { useAppDispatch } from "../../redux/hooks";
import { useMemo } from "react";
import { hideMessageBar, MessageBarState, showMessageBar } from "./slice";

export const useMessageBar = () => {
  const dispatch = useAppDispatch();
  return useMemo(
    () => ({
      show: (message: string, severity?: MessageBarState["severity"]) => {
        return dispatch(showMessageBar({ message, severity }));
      },
      hide: () => dispatch(hideMessageBar()),
    }),
    [dispatch]
  );
};
