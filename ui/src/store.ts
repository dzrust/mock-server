import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { postmanAPI } from "./services/postman";
import { routeAPI } from "./services/routes";
import appSlice, { isLoadingMiddleware } from "./slice/app-slice";

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [routeAPI.reducerPath]: routeAPI.reducer,
    [postmanAPI.reducerPath]: postmanAPI.reducer,
    app: appSlice,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    routeAPI.middleware,
    postmanAPI.middleware,
    isLoadingMiddleware,
  ],
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
