import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import * as compassApi from "./compass-api";
import * as statsApi from "./stats-api";
import * as messageBarSlice from "../features/message-bar/slice";
import * as walletSlice from "./wallet";
import * as editorSlice from "../features/editor/slice";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [compassApi.NAMESPACE]: compassApi.reducer,
    [statsApi.NAMESPACE]: statsApi.reducer,
    [messageBarSlice.NAMESPACE]: messageBarSlice.reducer,
    [walletSlice.NAMESPACE]: walletSlice.reducer,
    [editorSlice.NAMESPACE]: editorSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    compassApi.middleware,
    statsApi.middleware,
  ],
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
