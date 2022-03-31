import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import { ConnectorName, connectors } from "./lib";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { messageBarActions } from "../message-bar/slice";
import { Web3Provider } from "@ethersproject/providers";
import { walletActions, walletSelectors } from "../../redux/wallet";

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
  const { error, account: injectedAccount } = useWeb3React<Web3Provider>();
  const tried = useEagerConnect();

  const reduxAccount = useAppSelector(walletSelectors.connectedAccount);
  const hasAuth = useAppSelector(walletSelectors.hasAuth);

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

  useEffect(() => {
    if (!hasAuth) {
      dispatch(walletActions.reset());
    }
  }, [hasAuth]);

  useEffect(() => {
    if (
      tried &&
      injectedAccount?.toLocaleLowerCase() !== reduxAccount?.toLocaleLowerCase()
    ) {
      dispatch(walletActions.reset());
    }
  }, [tried, injectedAccount, reduxAccount]);
};

export const useWeb3Activate = () => {
  const { activate, active } = useWeb3React();

  return useCallback(
    async (connectorName?: ConnectorName) => {
      if (!active) {
        return activate(connectors[connectorName ?? "injected"]);
      }
    },
    [active]
  );
};
