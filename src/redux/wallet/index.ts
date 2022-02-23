import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSliceSelector } from "../utils";

export const NAMESPACE = "wallet";

type WalletState = {
  address: string;
};

const initialState: WalletState = {
  address: "",
};

const slice = createSlice({
  name: NAMESPACE,
  initialState,
  reducers: {
    connectAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    disconnectAddress: (state) => {
      state.address = "";
    },
  },
});

export const { reducer } = slice;
export const walletActions = slice.actions;

const sliceSelector = createSliceSelector(NAMESPACE);
const connectedAddress = createSelector(
  sliceSelector,
  (wallet) => wallet.address
);
export const walletSelectors = { connectedAddress };
