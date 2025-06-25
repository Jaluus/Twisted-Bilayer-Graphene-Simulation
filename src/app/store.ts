import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import moireReducer from "@/app/slices/moireSlice";
import bandstructureReducer from "@/app/slices/bandstructureSlice";

// Define a reset action type
const RESET_ACTION_TYPE = "root/reset";

// Create a root reducer that handles the reset action
const appReducer = combineReducers({
  moire: moireReducer,
  bandstructure: bandstructureReducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Action
) => {
  if (action.type === RESET_ACTION_TYPE) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

// Infer the type of `store`
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;

// Action creator for resetting the state
export const resetStore = () => ({ type: RESET_ACTION_TYPE });
