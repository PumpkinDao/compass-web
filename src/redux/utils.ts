import { RootState } from "./store";

export const createSliceSelector =
  <T>(key: string) =>
  (state: RootState) =>
    state[key] as T;
