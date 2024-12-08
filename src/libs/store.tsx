import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

export const root = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof root.getState>;
export type AppDispatch = typeof root.dispatch;