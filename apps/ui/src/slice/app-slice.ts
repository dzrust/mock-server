import {
  createSlice,
  isRejectedWithValue,
  Middleware,
  MiddlewareAPI,
  isPending,
  isFulfilled,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Notification } from "../models/notification";

// Define a type for the slice state
interface AppState {
  loadingCount: number;
  notifications: Notification[];
}

// Define the initial state using that type
const initialState: AppState = {
  loadingCount: 0,
  notifications: [],
};

export const appSlice = createSlice({
  name: "app",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loadingCount += 1;
    },
    stopLoading: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    addNotification: (state, payload: PayloadAction<Notification>) => {
      state.notifications = [payload.payload, ...state.notifications];
    },
    removeNotification: (state, payload: PayloadAction<number>) => {
      state.notifications = state.notifications.filter((_, index) => index !== payload.payload);
    },
  },
});

export const { startLoading, stopLoading, addNotification, removeNotification } = appSlice.actions;

export const isLoading = (state: RootState) => state.app.loadingCount > 0;

export default appSlice.reducer;

export const isLoadingMiddleware: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
  // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
  if (isRejectedWithValue(action) || isFulfilled(action)) {
    api.dispatch(stopLoading());
  }

  if (isPending(action)) {
    api.dispatch(startLoading());
  }

  return next(action);
};
