import { createSelector, createSlice } from "@reduxjs/toolkit";
import { createSliceSelector } from "../utils";
import { statEndpoints } from "../stats-api";
import { keccak256 } from "@ethersproject/keccak256";
import { decode as base64Decode } from "@ethersproject/base64/lib/base64";

export const NAMESPACE = "wallet";

type WalletState = {
  account?: string;
  auth?: {
    token: string;
    expiredAt: number;
  };
};

const initialState: WalletState = {};

const slice = createSlice({
  name: NAMESPACE,
  initialState,
  reducers: {
    reset: (state) => {
      delete state.account;
      delete state.auth;
    },
  },
  extraReducers: (builder) =>
    builder.addMatcher(
      statEndpoints.requestSession.matchFulfilled,
      (state, action) => {
        const {
          meta: {
            arg: { originalArgs: auth },
          },
        } = action;
        const { expiredAt } = action.payload;

        const { address } = JSON.parse(atob(auth));
        const token = keccak256(base64Decode(auth));

        state.account = address;
        state.auth = { token, expiredAt };
      }
    ),
});

export const { reducer } = slice;
export const walletActions = slice.actions;

const sliceSelector = createSliceSelector<WalletState>(NAMESPACE);
const connectedAccount = createSelector(
  sliceSelector,
  (wallet) => wallet.account
);
const hasAuth = createSelector(
  sliceSelector,
  (wallet) => wallet.auth && wallet.auth.expiredAt > Date.now()
);
export const walletSelectors = { connectedAccount, hasAuth };
