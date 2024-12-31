import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const destination_server = "http://localhost:3000";

type TransactionByAccount = {
    _id: string
    bank_sender_id: string
    bank_recipient_id: string
    sender_number: string
    recipient_number: string
    payment_method: "Sender Pay" | "Recipient Pay"
    amount: number
    transaction_date: string
    isInterbank_transaction: boolean
    remarks: string
}

export type TransactionRecord = {
    transactionID: string
    bank_sender_id: string
    bank_recipient_id: string
    sender_info: {
        account_number: string
        name: string
    }
    recipient_info: {
        account_number: string
        name: string
    }
    payment_method: "Sender Pay" | "Recipient Pay"
    amount: number
    transaction_date: string
    isInterbank_transaction: boolean
    remarks: string
}

export type TransactionState = {
    error: string | null
    transactions: TransactionRecord[]
    loading: boolean
}

const initialState: TransactionState = {
    transactions: [],
    error: null,
    loading: false
}

export const fetchAccountTransaction = createAsyncThunk(
    "transaction/fetch",
    async (account_number: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`employee/user-all-transaction-by-account-number/${account_number}`);
            console.log("Transaction response: ", response.data);

            if (!response.data) {
                return []; // Return an empty array if there's no data
            }

            // Map over transactions and create promises for recipient and sender info
            const res = await Promise.all(
                response.data.map(async (transaction: TransactionByAccount) => {
                    const { recipient_number, sender_number, _id, ...rest } = transaction;

                    // Fetch recipient and sender details
                    const RecipientPromise = apiClient.get('accounts/transaction-target', {
                        params: { account_number: recipient_number },
                    });

                    const SenderPromise =
                        sender_number !== "employee_placeholder"
                            ? apiClient.get('accounts/transaction-target', {
                                params: { account_number: sender_number },
                            })
                            : Promise.resolve({
                                data: {target_data: { name: "Bank Employee Depositor", account_number: "employee_placeholder" }} ,
                            });

                    // Resolve both promises concurrently
                    const [RecipientResponse, SenderResponse] = await Promise.all([RecipientPromise, SenderPromise]);

                    // Return the transformed transaction
                    return {
                        ...rest,
                        transactionID: _id,
                        recipient_info: RecipientResponse.data.target_data,
                        sender_info: SenderResponse.data.target_data,
                    };
                })
            );

            return res; // Final resolved array
        } catch (error: any) {
            console.error("Transaction error: ", error);
            return rejectWithValue(
                error.response?.data || "An unexpected error occurred"
            );
        }
    }
);
export const sliceTransaction = createSlice({
    initialState,
    name: "transaction",
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountTransaction.pending, (state) => {
                state.error = null;
                state.loading = true;
            })
            .addCase(fetchAccountTransaction.fulfilled, (state, action) => {
                state.transactions = action.payload;
                state.error = null;
                state.loading = false;
            })
            .addCase(fetchAccountTransaction.rejected, (state, action) => {
                state.error = action.payload as string;
                state.transactions = [];
                state.loading = false;
                console.error("Transaction error: ", action.payload);
            })

    }
})

export const { } = sliceTransaction.actions;
export const transactionReducer = sliceTransaction.reducer;