import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSliceSelector } from "../utils";

export const NAMESPACE = "wallet";

type WalletState = {
  account: string | undefined;
};

const initialState: WalletState = {
  account: undefined,
};

const slice = createSlice({
  name: NAMESPACE,
  initialState,
  reducers: {
    connectAccount: (state, action: PayloadAction<string>) => {
      state.account = action.payload;
    },
    disconnectAccount: (state) => {
      state.account = undefined;
    },
  },
});

export const { reducer } = slice;
export const walletActions = slice.actions;

const sliceSelector = createSliceSelector(NAMESPACE);
const connectedAccount = createSelector(
  sliceSelector,
  (wallet) => wallet.account
);
export const walletSelectors = { connectedAccount };
