import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import { connectors } from "./lib";
import { useAppDispatch } from "../../redux/hooks";
import { walletActions } from "../../redux/wallet";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { messageBarActions } from "../message-bar/slice";

export const useEagerConnect = () => {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    connectors.injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(connectors.injected, undefined, true).catch((e) => {
          console.error("Error in eager connect. error: ", e);

          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, []); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
};

const getErrorMessage = (error: Error) => {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return "Please authorize this website to access your Ethereum account.";
  } else {
    return "An unknown error occurred. Check the console for more details.";
  }
};

export const useReduxSync = () => {
  const dispatch = useAppDispatch();
  const { account, error } = useWeb3React();

  useEffect(() => {
    if (account) {
      dispatch(walletActions.connectAccount(account));
    } else {
      dispatch(walletActions.disconnectAccount());
    }
  }, [account]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const errorMessage = getErrorMessage(error);
    dispatch(
      messageBarActions.show({
        message: errorMessage,
        severity: "error",
      })
    );
  }, [error]);
};

export const useWeb3Activate = () => {
  const { activate, active } = useWeb3React();

  return useCallback(
    (connectorName: keyof typeof connectors = "injected") => {
      if (active) {
        console.warn("Web3 is active already");
        return;
      }

      activate(connectors[connectorName]).catch(() => {
        // handled already, ignore here
      });
    },
    [active]
  );
};
