import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import * as compassApi from "./compass-api";
import * as messageBarSlice from "../features/message-bar/slice";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [compassApi.NAMESPACE]: compassApi.reducer,
    [messageBarSlice.NAMESPACE]: messageBarSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    compassApi.middleware,
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
