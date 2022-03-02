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

const api = createApi({
  reducerPath: NAMESPACE,
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_STATS_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    listScripts: builder.query<Omit<Script, "code">[], string>({
      query: (owner: string) => ({
        url: `scripts?owner=${owner}`,
        method: "GET",
      }),
      transformResponse: transformResponse,
    }),
    getScript: builder.query<Script, string>({
      query: (scriptId: string) => ({
        url: `script?scriptId=${scriptId}`,
        method: "GET",
      }),
      transformResponse: transformResponse,
    }),
    addScript: builder.mutation<
      { scriptId: string },
      { owner: string; code: string; localScriptId: string }
    >({
      query: (body) => ({
        url: "script/add",
        method: "POST",
        body: {
          owner: body.owner,
          code: body.code,
        },
      }),
      transformResponse: transformResponse,
    }),
    updateScript: builder.mutation<
      { scriptId: string },
      { scriptId: string; code: string }
    >({
      query: (body) => ({
        url: "script",
        method: "POST",
        body: body,
      }),
      transformResponse: transformResponse,
    }),
    getScriptMeta: builder.query<MetaData & { scriptId: string }, string>({
      query: (scriptId: string) => ({
        url: `script/meta?scriptId=${scriptId}`,
        method: "GET",
      }),
      transformResponse: transformResponse,
    }),
    runScript: builder.mutation<
      {
        timeUsed: number;
        result: { status: "fulfilled" | "rejected"; value: unknown };
      },
      { scriptId: string; params: Record<string, unknown> }
    >({
      query: (body) => ({
        url: "script/run",
        method: "POST",
        body: body,
      }),
      transformResponse: transformResponse,
    }),
    listTriggers: builder.query<Trigger[], string>({
      query: (owner: string) => ({
        url: `triggers/${owner}`,
        method: "GET",
      }),
      transformResponse: transformResponse,
    }),
    addTrigger: builder.mutation<
      { triggerId: number },
      Pick<Trigger, "name" | "scriptId" | "params">
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
        url: `trigger/${triggerId}`,
        method: "DELETE",
      }),
    }),
    listTriggerActivities: builder.query<TriggerActivity[], number>({
      query: (triggerId: number) => ({
        url: `trigger/${triggerId}/activities`,
        method: "GET",
      }),
      transformResponse: transformResponse,
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
  useLazyGetScriptMetaQuery,
  useRunScriptMutation,
  useLazyListTriggersQuery,
  useAddTriggerMutation,
  useListTriggerActivitiesQuery,
  useDeleteTriggerMutation,
} = api;
