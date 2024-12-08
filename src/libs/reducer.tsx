import { combineReducers } from "@reduxjs/toolkit";
import { taskReducer } from "./slices/sliceTask";
import { authReducer } from "./slices/sliceAuth";

export const rootReducer = combineReducers({
    task: taskReducer,
    auth: authReducer
});