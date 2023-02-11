// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Collection, PartialCollection } from "../models/collection";

// Define a service using a base URL and expected endpoints
export const postmanAPI = createApi({
  reducerPath: "postmanAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.getpostman.com",
    prepareHeaders(headers) {
      if (!window.localStorage.getItem("postman-api-key")) {
        window.localStorage.setItem("postman-api-key", "");
      }
      headers.set("X-API-Key", window.localStorage.getItem("postman-api-key")!);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCollections: builder.query<{ collections: PartialCollection[] }, void>({
      query: () => `collections`,
    }),
    getCollection: builder.query<{ collection: Collection }, string>({
      query: (id) => `collections/${id}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetCollectionQuery, useGetCollectionsQuery } = postmanAPI;
