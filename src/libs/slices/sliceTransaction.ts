import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const destination_server = "http://localhost:3000";

const initialState = {
    transactions: [],
    error: null,
}

export const fetchTransaction = createAsyncThunk(
    "transaction/fetch",
    async () => {
        const response = await apiClient.get(`${destination_server}/transactions`);
        return response.data;
    }
);
export const sliceTransaction = createSlice({
    initialState,
    name: "auth",
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            
    }
})

export const {  } = sliceTransaction.actions;
export const authReducer = sliceTransaction.reducer;