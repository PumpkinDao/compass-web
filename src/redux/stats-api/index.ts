import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export const NAMESPACE = "statsApi";

const transformResponse = <T>(response: { result: T }) => response.result;

export type MetaData = {
  name: string;
  description: string;
  tag: string;
  updatedAt: number;
  args: string;
};

export type Script = {
  id: string;
  code: string;
  meta: MetaData;
};

export type Trigger = {
  id: number;
  owner: string;
  name: string;
  scriptId: string;
  params: string;
  lastRunTime?: number;
};

export type StatementResult = {
  statement: {
    operator: OP;
    keyword: string;
    expect: string;
    notifier: string;
  };
  op: PromiseSettledResult<boolean>;
  notify: PromiseSettledResult<"ok" | "disabled" | "throttled">;
};

export type TriggerActivity = {
  id: number;
  triggerId: number;
  timeUsed: number;
  result: string;
  createdAt: number;
  statementResults: StatementResult[];
};

export type NotifierVariant = "webhook" | "slack";

export type Notifier = {
  id: number;
  owner: string;
  name: string;
  variant: NotifierVariant;
  payload: string;
  createdAt: number;
};

export type DraftNotifier = Omit<Notifier, "id" | "createdAt">;

export type OP =
  | "eq"
  | "nq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "range"
  | "exist"
  | "error";

export type Statement = {
  id: number;
  triggerId: number;
  operator: OP;
  keyword: string;
  expect: string;
  notifier: string;
  notifyMsg: string;
  throttleTimeout: number;
};

export type DraftStatement = Omit<Statement, "id" | "notifier"> & {
  notifierId: number;
};

const api = createApi({
  reducerPath: NAMESPACE,
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_STATS_API_BASE_URL,
    mode: "cors",
    prepareHeaders: (
      headers: Headers,
      api: {
        getState: () => unknown;
      }
    ) => {
      const { wallet } = (api.getState() as RootState) || {};
      const { account, auth } = wallet || {};

      if (account && auth?.token) {
        headers.set("Authorization", auth.token);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    requestSession: builder.mutation<{ expiredAt: number }, string>({
      query: (auth: string) => ({
        url: "session",
        method: "POST",
        body: { auth },
      }),
      transformResponse,
    }),
    listScripts: builder.query<Omit<Script, "code">[], string>({
      query: (owner: string) => `scripts?owner=${owner}`,
      transformResponse,
    }),
    getScript: builder.query<Script, string>({
      query: (scriptId: string) => `scripts/${scriptId}`,
      transformResponse,
    }),
    addScript: builder.mutation<
      { scriptId: string },
      { owner: string; code: string; localScriptId: string }
    >({
      /* eslint-disable */
      query: ({ localScriptId: _, ...body }) => ({
        url: "scripts",
        method: "POST",
        body,
      }),
      transformResponse,
    }),
    updateScript: builder.mutation<
      { scriptId: string },
      { scriptId: string; code: string }
    >({
      query: ({ scriptId, ...body }) => ({
        url: `scripts/${scriptId}`,
        method: "PATCH",
        body: body,
      }),
      transformResponse,
    }),
    deleteScript: builder.mutation<undefined, string>({
      query: (scriptId) => ({
        url: `scripts/${scriptId}`,
        method: "DELETE",
      }),
    }),
    getScriptMeta: builder.query<MetaData & { scriptId: string }, string>({
      query: (scriptId: string) => `scripts/${scriptId}/meta`,
      transformResponse,
    }),
    runScript: builder.mutation<
      {
        timeUsed: number;
        result: { status: "fulfilled" | "rejected"; value: unknown };
      },
      { scriptId: string; params: string }
    >({
      query: ({ scriptId, ...body }) => ({
        url: `scripts/${scriptId}/run`,
        method: "POST",
        body: body,
      }),
      transformResponse,
    }),
    listTriggers: builder.query<Trigger[], string>({
      query: (owner: string) => `triggers?owner=${owner}`,
      transformResponse,
    }),
    addTrigger: builder.mutation<
      { triggerId: number },
      Pick<Trigger, "name" | "scriptId" | "params" | "owner">
    >({
      query: (body) => ({
        url: "triggers",
        method: "POST",
        body: body,
      }),
      transformResponse,
    }),
    deleteTrigger: builder.mutation<undefined, number>({
      query: (triggerId) => ({
        url: `triggers/${triggerId}`,
        method: "DELETE",
      }),
    }),
    listTriggerActivities: builder.query<TriggerActivity[], number>({
      query: (triggerId: number) => `triggers/${triggerId}/activities`,
      transformResponse,
    }),
    listNotifiers: builder.query<Notifier[], string>({
      query: (owner: string) => `notifiers?owner=${owner}`,
      transformResponse,
    }),
    addNotifier: builder.mutation<undefined, DraftNotifier>({
      query: (body) => ({
        url: `notifiers`,
        method: "POST",
        body: body,
      }),
      transformResponse,
    }),
    deleteNotifier: builder.mutation<Notifier[], number>({
      query: (notifierId) => ({
        url: `notifiers/${notifierId}`,
        method: "DELETE",
      }),
      transformResponse,
    }),
    addStatement: builder.mutation<undefined, DraftStatement>({
      query: ({ triggerId, ...body }) => ({
        url: `triggers/${triggerId}/statements`,
        method: "POST",
        body: { ...body, severity: "info" },
      }),
      transformResponse,
    }),
    listStatements: builder.query<Statement[], number>({
      query: (triggerId) => `triggers/${triggerId}/statements`,
      transformResponse,
    }),
    deleteStatement: builder.mutation<undefined, number>({
      query: (statementId: number) => ({
        url: `statements/${statementId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  reducer,
  middleware,
  endpoints: statEndpoints,
  useRequestSessionMutation,
  useLazyGetScriptQuery,
  useLazyListScriptsQuery,
  useAddScriptMutation,
  useUpdateScriptMutation,
  useDeleteScriptMutation,
  useLazyGetScriptMetaQuery,
  useRunScriptMutation,
  useLazyListTriggersQuery,
  useAddTriggerMutation,
  useListTriggerActivitiesQuery,
  useDeleteTriggerMutation,
  useListNotifiersQuery,
  useLazyListNotifiersQuery,
  useAddNotifierMutation,
  useDeleteNotifierMutation,
  useAddStatementMutation,
  useDeleteStatementMutation,
  useLazyListStatementsQuery,
} = api;
