import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const NAMESPACE = "statsApi";

const transformResponse = <T>(response: { result: T }) => response.result;

export type MetaData = {
  name: string;
  description: string;
  tag: string;
  updatedAt: number;
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

export type TriggerActivity = {
  id: number;
  triggerId: number;
  timeUsed: number;
  result: string;
  createdAt: number;
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

export type OP = "eq" | "nq" | "gt" | "gte" | "lt" | "lte" | "range" | "exist";

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
  }),
  endpoints: (builder) => ({
    listScripts: builder.query<Omit<Script, "code">[], string>({
      query: (owner: string) => `scripts?owner=${owner}`,
      transformResponse: transformResponse,
    }),
    getScript: builder.query<Script, string>({
      query: (scriptId: string) => `scripts/${scriptId}`,
      transformResponse: transformResponse,
    }),
    addScript: builder.mutation<
      { scriptId: string },
      { owner: string; code: string; localScriptId: string }
    >({
      query: ({ localScriptId: _, ...body }) => ({
        url: "scripts",
        method: "POST",
        body,
      }),
      transformResponse: transformResponse,
    }),
    updateScript: builder.mutation<
      { scriptId: string },
      { scriptId: string; code: string }
    >({
      query: ({ scriptId, ...body }) => ({
        url: `scripts/${scriptId}`,
        method: "POST",
        body: body,
      }),
      transformResponse: transformResponse,
    }),
    deleteScript: builder.mutation<undefined, string>({
      query: (scriptId) => ({
        url: `scripts/${scriptId}`,
        method: "DELETE",
      }),
    }),
    getScriptMeta: builder.query<MetaData & { scriptId: string }, string>({
      query: (scriptId: string) => `scripts/${scriptId}/meta`,
      transformResponse: transformResponse,
    }),
    runScript: builder.mutation<
      {
        timeUsed: number;
        result: { status: "fulfilled" | "rejected"; value: unknown };
      },
      { scriptId: string; params: Record<string, unknown> }
    >({
      query: ({ scriptId, ...body }) => ({
        url: `scripts/${scriptId}/run`,
        method: "POST",
        body: body,
      }),
      transformResponse: transformResponse,
    }),
    listTriggers: builder.query<Trigger[], string>({
      query: (owner: string) => `triggers?owner=${owner}`,
      transformResponse: transformResponse,
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
      transformResponse: transformResponse,
    }),
    deleteTrigger: builder.mutation<undefined, number>({
      query: (triggerId) => ({
        url: `triggers/${triggerId}`,
        method: "DELETE",
      }),
    }),
    listTriggerActivities: builder.query<TriggerActivity[], number>({
      query: (triggerId: number) => `triggers/${triggerId}/activities`,
      transformResponse: transformResponse,
    }),
    listNotifiers: builder.query<Notifier[], string>({
      query: (owner: string) => `notifiers?owner=${owner}`,
      transformResponse: transformResponse,
    }),
    addNotifier: builder.mutation<undefined, DraftNotifier>({
      query: (body) => ({
        url: `notifiers`,
        method: "POST",
        body: body,
      }),
      transformResponse: transformResponse,
    }),
    deleteNotifier: builder.mutation<Notifier[], number>({
      query: (notifierId) => ({
        url: `notifiers/${notifierId}`,
        method: "DELETE",
      }),
      transformResponse: transformResponse,
    }),
    addStatement: builder.mutation<undefined, DraftStatement>({
      query: ({ triggerId, ...body }) => ({
        url: `triggers/${triggerId}/statements`,
        method: "POST",
        body: { ...body, severity: "info" },
      }),
      transformResponse: transformResponse,
    }),
    listStatements: builder.query<Statement[], number>({
      query: (triggerId) => `triggers/${triggerId}/statements`,
      transformResponse: transformResponse,
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
