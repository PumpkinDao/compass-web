import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import * as compassApi from "./compass-api";
import * as statsApi from "./stats-api";
import * as messageBarSlice from "../features/message-bar/slice";
import * as walletSlice from "./wallet";
import * as editorSlice from "../features/editor/slice";
import * as triggerSlice from "../features/trigger/slice";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  [compassApi.NAMESPACE]: compassApi.reducer,
  [statsApi.NAMESPACE]: statsApi.reducer,
  [messageBarSlice.NAMESPACE]: messageBarSlice.reducer,
  [walletSlice.NAMESPACE]: walletSlice.reducer,
  [editorSlice.NAMESPACE]: editorSlice.reducer,
  [triggerSlice.NAMESPACE]: triggerSlice.reducer,
});

export const store = configureStore({
  reducer: persistReducer(
    {
      key: "root",
      version: 1,
      storage,
      whitelist: [walletSlice.NAMESPACE],
    },
    rootReducer
  ),
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
    compassApi.middleware,
    statsApi.middleware,
  ],
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
