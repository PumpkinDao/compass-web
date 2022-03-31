import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { walletSelectors } from "../../redux/wallet";
import { useWeb3Activate } from "../web3-root/hooks";
import { useWeb3React } from "@web3-react/core";
import { ConnectorName } from "../web3-root/lib";
import { Web3Provider } from "@ethersproject/providers";
import { useRequestSessionMutation } from "../../redux/stats-api";
import LoadingButton from "@mui/lab/LoadingButton";

const generateAuthMsg = (blockHash: string) => `
Welcome to compassdao.io.
Only sign this message for a trusted client!

blockHash: ${blockHash}
`; // todo change to correct host name

export const Login = () => {
  const { account, library } = useWeb3React<Web3Provider>();
  const activeWeb3 = useWeb3Activate();

  const hasAuth = useAppSelector(walletSelectors.hasAuth);
  const [authTrying, setAuthTrying] = useState<boolean>(false);
  const [requestSession, { isLoading: isLogging }] =
    useRequestSessionMutation();

  const doAuth = useCallback(async (library: Web3Provider, account: string) => {
    const { hash: blockHash } = await library.getBlock("latest");
    const message = generateAuthMsg(blockHash);
    const signature = await library.getSigner(account).signMessage(message);

    requestSession(
      btoa(
        JSON.stringify({
          address: account,
          blockHash,
          signature,
        })
      )
    );
  }, []);

  useEffect(() => {
    if (authTrying && library && account && !hasAuth) {
      setAuthTrying(false);
      doAuth(library, account);
    }
  }, [authTrying]);

  const login = useCallback(
    async (connectorName?: ConnectorName) => {
      if (!account) {
        return activeWeb3(connectorName).then(() => setAuthTrying(true));
      } else if (library && !hasAuth) {
        return doAuth(library, account);
      }
    },
    [library, account, hasAuth]
  );

  return (
    <LoadingButton
      variant={"contained"}
      loading={isLogging}
      disabled={hasAuth}
      onClick={() => login()}
    >
      {account && hasAuth
        ? `${account.slice(0, 6)}...${account.slice(-6)}`
        : "Connect"}
    </LoadingButton>
  );
};
