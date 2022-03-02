import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { statEndpoints, Trigger } from "../../redux/stats-api";
import { createSliceSelector } from "../../redux/utils";

type TriggerState = {
  triggers: Trigger[];
  selectedId?: number;
  isCreating: boolean;
};

export const NAMESPACE = "TRIGGER";

const initialState: TriggerState = {
  triggers: [],
  selectedId: undefined,
  isCreating: false,
};

const slice = createSlice({
  name: NAMESPACE,
  initialState,
  reducers: {
    select: (state, action: PayloadAction<number>) => {
      state.selectedId = action.payload;
    },
    enterCreating: (state) => {
      state.isCreating = true;
    },
    exitCreating: (state) => {
      state.isCreating = false;
    },
  },
  extraReducers: (builder) =>
    builder
      .addMatcher(
        statEndpoints.listTriggers.matchFulfilled,
        (state, action) => {
          const triggers = action.payload;
          state.triggers = triggers;
          state.selectedId = triggers[0]?.id;
        }
      )
      .addMatcher(statEndpoints.addTrigger.matchFulfilled, (state) => {
        state.isCreating = false;
      })
      .addMatcher(
        statEndpoints.deleteTrigger.matchFulfilled,
        (state, action) => {
          const {
            arg: { originalArgs: triggerId },
          } = action.meta;
          const index = state.triggers.findIndex((i) => i.id === triggerId);
          state.triggers = state.triggers.filter((i) => i.id !== triggerId);

          if (state.selectedId === triggerId) {
            state.selectedId =
              state.triggers.length > index
                ? state.triggers[index].id
                : state.triggers[0]?.id;
          }
        }
      ),
});

export const { reducer } = slice;
export const triggerActions = slice.actions;
const sliceSelector = createSliceSelector(NAMESPACE);

const allTriggers = createSelector(sliceSelector, (state) => state.triggers);
const selectedTriggerId = createSelector(
  sliceSelector,
  (state) => state.selectedId
);

const selectedTrigger = createSelector(
  [sliceSelector, selectedTriggerId],
  (state, selectedId) => state.triggers.find((i) => i.id === selectedId)
);

const isCreating = createSelector(sliceSelector, (state) => state.isCreating);

export const triggerSelectors = {
  allTriggers,
  selectedTrigger,
  selectedTriggerId,
  isCreating,
};
