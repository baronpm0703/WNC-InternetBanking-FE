import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Transaction } from "@/component/Resusable/columns";
const VITE_INTERNAlBANK_ID = import.meta.env.VITE_INTERNAlBANK_ID
export const destination_server = "http://localhost:3000";

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
            return response.data;
        } catch (error: any) {
            console.error("Error creating internal transaction:", error);
            return rejectWithValue(
                error.response?.data?.message || "Failed to create internal transaction."
            );
        }
    }
);

export const createExternalTransaction = createAsyncThunk(
    "transaction/createExternal",
    async (
        { transactionData, clientId }: { transactionData: any; clientId: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiClient.post(
                `${destination_server}/api/send-to-external-balance`,
                transactionData,
                {
                    headers: {
                        "x-client-id": clientId,
                    },
                }
            );
            return response.data; // Dữ liệu trả về từ API
        } catch (error: any) {
            console.error("Error creating external transaction:", error);
            return rejectWithValue(
                error.response?.data?.message || "Failed to create external transaction."
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

export type BankInfo = {
    _id: string,
    name: string,
    public_key: string,
    algorithm: string
}
type TransactionByAccount = {
    _id: string
    bank_sender_id: string | BankInfo
    bank_recipient_id: string | BankInfo
    sender_number: string
    recipient_number: string
    payment_method: "Sender Pay" | "Recipient Pay"
    amount: number
    transaction_date: string
    isInterBank_transaction: boolean
    remarks: string
}

export type TransactionRecord = {
    transactionID: string
    bank_sender_id: string | BankInfo
    bank_recipient_id: string | BankInfo
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
    isInterBank_transaction: boolean
    remarks: string
    bankInfo?: any
}

export type TransactionState = {
    error: string | null
    status: string
    transactions: TransactionRecord[]
    selectedTransaction?: Transaction | null
    loading: boolean
}

const initialState: TransactionState = {
    transactions: [],
    error: null,
    loading: false,
    status: "",
}

export interface slicePayload<T = string> {
    payload: T;
    type: string;
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
            const res = await Promise.allSettled(
                response.data.map(async (transaction: TransactionByAccount) => {
                    const { isInterBank_transaction, bank_recipient_id, bank_sender_id, recipient_number, sender_number, _id, ...rest } = transaction;

                    // Fetch recipient and sender details
                    let RecipientPromise: Promise<any>;
                    let SenderPromise: Promise<any>;

                    if (!isInterBank_transaction) {
                        RecipientPromise = apiClient.get('accounts/transaction-target', {
                            params: { account_number: recipient_number },
                        });
                        SenderPromise =
                            sender_number !== "employee_placeholder"
                                ? apiClient.get('accounts/transaction-target', {
                                    params: { account_number: sender_number },
                                })
                                : Promise.resolve({
                                    data: { target_data: { name: "Bank Employee Depositor", account_number: "employee_placeholder" } },
                                });
                    } else {
                        RecipientPromise = (bank_recipient_id as string) != VITE_INTERNAlBANK_ID ? apiClient.post("api/get-external-account", {
                            account_number: recipient_number
                        }, {
                            headers: {
                                "x-client-id": (bank_recipient_id as string)
                            }
                        }) : apiClient.get('accounts/transaction-target', {
                            params: { account_number: recipient_number },
                        });
                        SenderPromise = (bank_sender_id as string) != VITE_INTERNAlBANK_ID ? apiClient.post("api/get-external-account", {
                            account_number: sender_number
                        }, {
                            headers: {
                                "x-client-id": (bank_sender_id as string)
                            }
                        }) : apiClient.get('accounts/transaction-target', {
                            params: { account_number: sender_number },
                        })
                    }
                    // Resolve both promises concurrently
                    const [RecipientResponse, SenderResponse] = await Promise.all([RecipientPromise, SenderPromise]);

                    // Return the transformed transaction
                    return {
                        ...rest,
                        transactionID: _id,
                        isInterBank_transaction,
                        bank_recipient_id,
                        bank_sender_id,
                        recipient_info: RecipientResponse.data.target_data ? RecipientResponse.data.target_data : RecipientResponse.data,
                        sender_info: SenderResponse.data.target_data ? SenderResponse.data.target_data : SenderResponse.data,
                    };
                })
            );

            // Filter out fulfilled promises and extract their values
            const fulfilledTransactions = res
                .filter((result) => result.status === "fulfilled")
                .map((result) => (result as PromiseFulfilledResult<any>).value);

            return fulfilledTransactions.reverse(); // Return only successfully resolved transactions
        } catch (error: any) {
            console.error("Transaction error: ", error);
            return rejectWithValue(
                error.response?.data || "An unexpected error occurred"
            );
        }
    }
);

export const fetchSpecialTransaction = createAsyncThunk(
    "admin/transaction/fetch",
    async (_: void, { rejectWithValue }) => {
        try {
            const response = await apiClient.get("admin/get-external-transaction");
            console.log("Admin Transaction response: ", response.data);

            if (!response.data) {
                return []; // Return an empty array if there's no data
            }

            // Map over transactions and create promises for recipient and sender info
            const res = await Promise.allSettled(
                response.data.map(async (transaction: TransactionByAccount) => {
                    const { isInterBank_transaction, bank_recipient_id, bank_sender_id, recipient_number, sender_number, _id, ...rest } = transaction;

                    // Fetch recipient and sender details
                    let RecipientPromise: Promise<any>;
                    let SenderPromise: Promise<any>;

                    if (!isInterBank_transaction) {
                        RecipientPromise = apiClient.get('accounts/transaction-target', {
                            params: { account_number: recipient_number },
                        });
                        SenderPromise =
                            sender_number !== "employee_placeholder"
                                ? apiClient.get('accounts/transaction-target', {
                                    params: { account_number: sender_number },
                                })
                                : Promise.resolve({
                                    data: { target_data: { name: "Bank Employee Depositor", account_number: "employee_placeholder" } },
                                });
                    } else {
                        RecipientPromise = (bank_recipient_id as BankInfo)._id != VITE_INTERNAlBANK_ID ? apiClient.post("api/get-external-account", {
                            account_number: recipient_number
                        }, {
                            headers: {
                                "x-client-id": (bank_recipient_id as BankInfo)._id
                            }
                        }) : apiClient.get('accounts/transaction-target', {
                            params: { account_number: recipient_number },
                        });
                        SenderPromise = (bank_sender_id as BankInfo)._id != VITE_INTERNAlBANK_ID ? apiClient.post("api/get-external-account", {
                            account_number: sender_number
                        }, {
                            headers: {
                                "x-client-id": (bank_sender_id as BankInfo)._id
                            }
                        }) : apiClient.get('accounts/transaction-target', {
                            params: { account_number: sender_number },
                        });
                    }

                    // Resolve both promises concurrently
                    const [RecipientResponse, SenderResponse] = await Promise.all([RecipientPromise, SenderPromise]);

                    // Return the transformed transaction
                    return {
                        ...rest,
                        transactionID: _id,
                        isInterBank_transaction,
                        bank_recipient_id,
                        bank_sender_id,
                        recipient_info: RecipientResponse.data.target_data ? RecipientResponse.data.target_data : RecipientResponse.data,
                        sender_info: SenderResponse.data.target_data ? SenderResponse.data.target_data : SenderResponse.data,
                    };
                })
            );

            // Filter out fulfilled promises and extract their values
            const fulfilledTransactions = res
                .filter((result) => result.status === "fulfilled")
                .map((result) => (result as PromiseFulfilledResult<any>).value);

            return fulfilledTransactions.reverse(); // Return only successfully resolved transactions
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
        selectTransaction: (state, action: slicePayload<Transaction>) => {
            state.selectedTransaction = action.payload || null;
        },
        resetSelected: (state) => {
            state.selectedTransaction = null;
            state.error = ""
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSpecialTransaction.pending, (state) => {
                state.error = null;
                state.loading = true;
            })
            .addCase(fetchSpecialTransaction.fulfilled, (state, action) => {
                state.transactions = action.payload;
                state.error = null;
                state.loading = false;
            })
            .addCase(fetchSpecialTransaction.rejected, (state, action) => {
                state.error = action.payload as string;
                state.transactions = [];
                state.loading = false;
                console.error("Admin Fetch Transaction error: ", action.payload);
            })
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
            .addCase(sendOtpTransactionSameBank.fulfilled, (state, action) => {
                state.transactions.push(action.payload);
                state.error = "";
            })
            .addCase(sendOtpTransactionSameBank.rejected, (state, action) => {
                state.error = action.payload as string || "Failed to create transaction.";
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
                state.error = action.payload as string || "An unexpected error occurred.";
            })
            .addCase(createExternalTransaction.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createExternalTransaction.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.transactions.push(action.payload);
                state.error = null;
            })
            .addCase(createExternalTransaction.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    }
})

export const { selectTransaction, resetSelected } = sliceTransaction.actions;
export const transactionReducer = sliceTransaction.reducer;