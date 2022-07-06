// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Route } from "../models/route";
import { Response } from "../models/response";
import { PostmanRoute } from "../models/postman-route";

// Define a service using a base URL and expected endpoints
export const routeAPI = createApi({
  reducerPath: "routeAPI",
  tagTypes: ["Responses", "Routes"],
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:9001/ent/admin" }),
  endpoints: (builder) => ({
    getResponses: builder.query<Response[], number>({
      query: (id) => `routes/${id}/responses`,
      providesTags: ["Responses"],
    }),
    createResponse: builder.mutation<void, Omit<Response, "id">>({
      query: (body) => ({
        url: `routes/${body.routeId}/responses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Responses", "Routes"],
    }),
    updateResponse: builder.mutation<void, Response>({
      query: (body) => ({
        url: `routes/${body.routeId}/responses/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Responses", "Routes"],
    }),
    getRoutes: builder.query<Route[], void>({
      query: () => `routes`,
      providesTags: ["Routes"],
    }),
    createRoute: builder.mutation<void, Omit<Route, "id" | "currentExampleId">>({
      query: (body) => ({
        url: `routes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Responses", "Routes"],
    }),
    updateRoute: builder.mutation<void, Route>({
      query: (body) => ({
        url: `routes/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Responses", "Routes"],
    }),
    postPostmanRoutes: builder.mutation<
      | {
          createdRoutes: string[];
          updatedRoutes: string[];
          failedRoutes: { postmanId: string; error: string }[];
          createdResponses: string[];
          updatedResponses: string[];
          failedResponses: { postmanId: string; error: string }[];
        }
      | { error: string },
      PostmanRoute[]
    >({
      query: (body) => ({
        url: `postman/sync`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Responses", "Routes"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useCreateResponseMutation,
  useGetResponsesQuery,
  useUpdateResponseMutation,
  usePostPostmanRoutesMutation
} = routeAPI;
