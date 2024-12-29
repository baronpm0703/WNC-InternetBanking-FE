import { combineReducers } from "@reduxjs/toolkit";
import { taskReducer } from "./slices/sliceTask";
import { authReducer } from "./slices/sliceAuth";
import { accountReducer } from "./slices/sliceAccount";

export const rootReducer = combineReducers({
    task: taskReducer,
    auth: authReducer,
    account: accountReducer,
});