import { combineReducers } from "@reduxjs/toolkit";
import { taskReducer } from "./slices/sliceTask";
import { authReducer } from "./slices/sliceAuth";
import { accountReducer } from "./slices/sliceAccount";
import { transactionReducer } from "./slices/sliceTransaction";
import { externalBanksReducer } from "./slices/sliceExternalBank";
import { debtReducer } from "./slices/sliceDebt";

export const rootReducer = combineReducers({
    task: taskReducer,
    auth: authReducer,
    account: accountReducer,
    transaction: transactionReducer,
    externalBanks: externalBanksReducer,
    debt: debtReducer
});