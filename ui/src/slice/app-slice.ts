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

// Define a type for the slice state
interface AppState {
  loadingCount: number;
  error?: string;
}

// Define the initial state using that type
const initialState: AppState = {
  loadingCount: 0,
  error: undefined,
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
    setError: (state, payload: PayloadAction<string | undefined>) => {
      state.error = payload.payload;
    },
  },
});

export const { startLoading, stopLoading, setError } = appSlice.actions;

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
