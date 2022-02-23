import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useCallback, useEffect } from "react";
import { injectedNetworkConnector } from "../../web3/connector";
import { useAppDispatch } from "../hooks";
import { walletActions } from "./index";

export const useWeb3ReactActivate = () => {
  const dispatch = useAppDispatch();
  const { active, activate, account } = useWeb3React<Web3Provider>();

  useEffect(() => {
    if (account) {
      dispatch(walletActions.connectAddress(account));
    } else {
      dispatch(walletActions.disconnectAddress());
    }
  }, [account]);

  useEffect(() => {
    injectedNetworkConnector.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        return activate(injectedNetworkConnector);
      }
    });
  }, []);

  return useCallback(async () => {
    if (!active && activate) {
      return activate(injectedNetworkConnector);
    }
  }, [active, activate]);
};
