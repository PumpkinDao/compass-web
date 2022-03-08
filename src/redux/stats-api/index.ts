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

const api = createApi({
  reducerPath: NAMESPACE,
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_STATS_API_BASE_URL,
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
