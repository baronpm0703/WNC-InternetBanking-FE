import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const destination_server = "http://localhost:3000";

const initialState = {
    transactions: [],
    error: "",
    status: "",
}

export const fetchTransaction = createAsyncThunk(
    "transaction/fetch",
    async () => {
        const response = await apiClient.get(`${destination_server}/transactions`);
        return response.data;
    }
);

export const createInternalTransaction = createAsyncThunk(
    "transaction/createInternal",
    async (transactionData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(
                `${destination_server}/transact/create-internal`,
                transactionData, // Payload cần thiết
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Thêm header nếu cần
                    },
                }
            );
            return response.data; // Dữ liệu trả về từ API
        } catch (error: any) {
            console.error("Error creating internal transaction:", error);
            return rejectWithValue(
                error.response?.data?.message || "Failed to create internal transaction."
            );
        }
    }
);

export const sendOtpTransactionSameBank = createAsyncThunk(
    "transaction/sendOtpSameBank",
    async (transactionData, { rejectWithValue }) => {
        try {
            // Gửi dữ liệu qua endpoint
            const response = await apiClient.post(
                `${destination_server}/transact/attempt-transact`,
                transactionData
            );
            return response.data;
        } catch (error: any) {
            console.error("Error creating transaction:", error);

            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.message || "Failed to create transaction.");
            } else {
                return rejectWithValue("An unexpected error occurred.");
            }
        }
    }
);

export const sliceTransaction = createSlice({
    initialState,
    name: "auth",
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendOtpTransactionSameBank.fulfilled, (state, action) => {
                state.transactions.push(action.payload);
                state.error = "";
            })
            .addCase(sendOtpTransactionSameBank.rejected, (state, action) => {
                state.error = action.payload || "Failed to create transaction.";
            })
            .addCase(createInternalTransaction.pending, (state) => {
                state.status = "loading";
                state.error = "";
            })
            .addCase(createInternalTransaction.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.error = "";
            })
            .addCase(createInternalTransaction.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "An unexpected error occurred.";
            });

    }
})

export const { } = sliceTransaction.actions;
export const authReducer = sliceTransaction.reducer;