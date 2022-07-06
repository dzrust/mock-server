import { configureStore } from "@reduxjs/toolkit";
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from "@reduxjs/toolkit/query";
import { postmanAPI } from "./services/postman";
import { routeAPI } from "./services/routes";

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [routeAPI.reducerPath]: routeAPI.reducer,
    [postmanAPI.reducerPath]: postmanAPI.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) => [...getDefaultMiddleware(), routeAPI.middleware, postmanAPI.middleware],
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);
