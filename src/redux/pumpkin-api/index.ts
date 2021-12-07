import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MatrixResult, PoolsArg, PoolsResult } from "./types";

export const NAMESPACE = "pumpkinApi";

const transformResponse = <T>(response: { result: T }) => response.result;

const index = createApi({
  reducerPath: NAMESPACE,
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_COMPASS_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    ping: builder.query<{ timestamp: number }, undefined>({
      query: () => "ping",
      transformResponse: transformResponse,
    }),
    matrix: builder.query<MatrixResult, undefined>({
      query: () => "matrix",
      transformResponse: transformResponse,
    }),
    pools: builder.query<PoolsResult, PoolsArg>({
      query: (args: PoolsArg) => {
        let uri = "pools";

        if (typeof args === "object") {
          Array.isArray(args.protocolId) &&
            (args = Object.assign({}, args, {
              protocolId: args.protocolId.join(","),
            }));

          const params = new URLSearchParams(args as never);
          uri += "?" + params.toString();
        }

        return uri;
      },
      transformResponse: transformResponse,
    }),
  }),
});

export const {
  reducer,
  middleware,
  usePingQuery,
  useMatrixQuery,
  useLazyPoolsQuery,
} = index;
