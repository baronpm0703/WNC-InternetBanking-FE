import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Debt } from "@/component/Resusable/columns";
import apiClient from "@/helper/apiClient";
import { fetchTransactionTarget } from "./sliceAccount";
import { AppDispatch } from "../store";

interface DebtState {
    inDebt: Debt[];
    createdDebt: Debt[];
    unpaidDebt: Debt[];
    selectedDebt: Debt | null;
    isRepayModalOpen: boolean;
    loading: boolean;
    error: string | null;
    isRepaySuccess?: boolean;
}

const initialState: DebtState = {
    inDebt: [],
    createdDebt: [],
    unpaidDebt: [],
    selectedDebt: null,
    isRepayModalOpen: false,
    loading: false,
    error: null,
    isRepaySuccess: false
};

export interface RepayDebtInfo {
    debt_id: string,
    own_account_number:string,
    otp:string,
    target: {
        account_number:string,
        name:string
    }
}

export const createDebtRemind = createAsyncThunk(
    "debt/create",
    async (debtData: { account_number: string; amount: string; details: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post("/debt", debtData);
            return response.data;
        } catch (error: any) {
            console.error("Error creating debt remind:", error);
            return rejectWithValue(
                error.response?.data?.message || "Failed to create debt remind."
            );
        }
    }
);

export const fetchAllDebt = createAsyncThunk<Debt[], void, { rejectValue: string; dispatch: AppDispatch }>(
    "debt/fetchAllDebt",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.get(`http://localhost:3000/debt/all`);
            const data = response.data;

            // Sử dụng Promise.all để xử lý song song việc fetch debtor name
            const debts: Debt[] = await Promise.all(
                data.map(async (item: any) => {
                    const random = Math.floor(Math.random() * 100);

                    // Fetch debtor name bằng cách dispatch fetchTransactionTarget
                    let debtorName = "Unknown Debtor";
                    if (item.debtor_number) {
                        try {
                            // const result = await dispatch(fetchTransactionTarget(item.debtor_number)).unwrap();
                            const result = await apiClient.get('accounts/transaction-target', {
                                params: { account_number: item.debtor_number },
                            });
                            debtorName = result.data.target_data?.name || "Unknown Debtor";
                        } catch (error) {
                            console.error(`Error fetching debtor name for ${item.debtor_number}:`, error);
                        }
                    }

                    return {
                        id: item._id,
                        bank_id: item.owner_id?.payment_account_id || "Unknown Bank",
                        debtID: item._id,
                        debtor_info: {
                            account_number: item.debtor_number || "Unknown",
                            name: debtorName,
                        },
                        debtee_info: {
                            account_number: item.debtee_number || "Unknown",
                            name: item.owner_id?.name || "Unknown Debtee",
                        },
                        amount: item.amount || 0,
                        debtRemind_date: item.created_at || "N/A",
                        detail: item.detail || "No Details",
                        status: item.status || "Pending",
                        identity: {
                            name: item.owner_id?.name || "Unknown",
                            phone: item.owner_id?.phone || "N/A",
                            avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`,
                        },
                    };
                })
            );

            return debts.reverse();
        } catch (error) {
            console.error("Error fetching all debts:", error);
            return rejectWithValue((error as Error).message);
        }
    }
);


export const fetchUnpaidInDebt = createAsyncThunk<Debt[], string, { rejectValue: string }>(
    "debt/fetchUnpaidInDebt",
    async (debtorNumber, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.get(
                `http://localhost:3000/debt/unpaid?debtor_number=${debtorNumber}`
            );
            const data = response.data;

            const debts: Debt[] = await Promise.all(
                data.map(async (item: any) => {
                    const random = Math.floor(Math.random() * 100);

                    let debtorName = "Unknown Debtor";
                    let debtorAccountNumber = "Unknown Debtor";
                    try {
                        // const result = await dispatch(fetchTransactionTarget(item.debtor_number)).unwrap();
                        const result = await apiClient.get('accounts/transaction-target', {
                            params: { account_number: item.debtor_number },
                        });
                        debtorName = result.data.target_data?.name || "Unknown Debtor";
                        debtorAccountNumber = result.data.target_data?.account_number || "N/A";
                        console.log("Fetched debtorAccountNumber:", debtorAccountNumber);
                    } catch (error) {
                        console.error("Error fetching debtor name:", error);
                    }
                    return {
                        id: item._id,
                        debtor_number: item.debtor_number,
                        debtee_number: item.debtee_number,
                        bank_id: item.owner_id?.payment_account_id || "Unknown Bank",
                        debtID: item._id,
                        debtor_name: debtorName,
                        debtee_name: item.owner_id?.name,
                        amount: item.amount || 0,
                        debtRemind_date: item.created_at || "N/A",
                        detail: item.detail || "No Details",
                        status: item.status || "Pending",
                        identity: {
                            name: item.owner_id?.name || "Unknown",
                            phone: item.owner_id?.phone || "N/A",
                            avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`,
                        },
                    };
                })
            );


            return debts.reverse();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const fetchCreatedDebt = createAsyncThunk<Debt[], string, { rejectValue: string }>(
    "debt/fetchCreatedDebt",
    async (debtorNumber, { rejectWithValue, dispatch }) => {
        try {
            const response = await apiClient.get(
                `http://localhost:3000/debt/created?debtee_number=${debtorNumber}`
            );
            const data = response.data;

            const createdDebts: Debt[] = await Promise.all(
                data.map(async (item: any) => {
                    const random = Math.floor(Math.random() * 100);

                    let debtorName = "Unknown Debtor";
                    try {
                        // const result = await dispatch(fetchTransactionTarget(item.debtor_number)).unwrap();
                        const result = await apiClient.get('accounts/transaction-target', {
                            params: { account_number: item.debtor_number },
                        });
                        debtorName = result.data.target_data?.name || "Unknown Debtor";
                    } catch (error) {
                        console.error("Error fetching debtor name:", error);
                    }

                    return {
                        id: item._id,
                        bank_id: item.owner_id?.payment_account_id || "Unknown Bank",
                        debtID: item._id,
                        debtee_number: item.debtee_number,
                        debtor_number: item.debtor_number,

                        debtee_name: item.owner_id?.name,
                        debtor_name: debtorName,
                        amount: item.amount || 0,
                        debtRemind_date: item.created_at || "N/A",
                        detail: item.detail || "No Details",
                        status: item.status || "Pending",
                        identity: {
                            name: item.owner_id?.name || "Unknown",
                            phone: item.owner_id?.phone || "N/A",
                            avt: `https://randomuser.me/api/portraits/med/men/${random}.jpg`,
                        },
                    };
                })
            );

            return createdDebts.reverse();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const cancelDebt = createAsyncThunk<
    any,
    { debt_id: string; detail: string },
    { rejectValue: string }
>("debt/cancelDebt", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiClient.post("/debt/cancel", payload);
        return response.data;
    } catch (error: any) {
        console.error("Error cancelling debt:", error.response?.data || error.message);
        return rejectWithValue(error.response?.data?.message || "Failed to cancel debt");
    }
});
export const repayDebt = createAsyncThunk(
    "debt/repayDebt",
    async (debtInfo: RepayDebtInfo, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`debt/pay`, debtInfo);
            return response.data;
        } catch (error) {
            console.log("Error repaying debt:", error);
            return rejectWithValue((error as Error).message);
        }
    }
)

const debtSlice = createSlice({
    name: "debt",
    initialState,
    reducers: {
        selectDebt: (state, action: PayloadAction<Debt | null>) => {
            state.selectedDebt = action.payload;
            console.log("HOHOH", action.payload);
        },
        toggleRepayModal: (state, action: PayloadAction<boolean>) => {
            state.isRepayModalOpen = action.payload; // Toggle the modal state
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCreatedDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreatedDebt.fulfilled, (state, action: PayloadAction<Debt[]>) => {
                state.loading = false;
                state.createdDebt = action.payload; // Set fetched and converted debts
            })
            .addCase(fetchCreatedDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch debts";
            })
            .addCase(fetchUnpaidInDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnpaidInDebt.fulfilled, (state, action: PayloadAction<Debt[]>) => {
                state.loading = false;
                state.unpaidDebt = action.payload;
            })
            .addCase(fetchUnpaidInDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch debts";
            })
            .addCase(fetchAllDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllDebt.fulfilled, (state, action) => {
                state.loading = false;
                state.inDebt = action.payload; // Lưu dữ liệu fetch vào state
            })
            .addCase(fetchAllDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch debts"; // Xử lý lỗi nếu có
            })
            .addCase(cancelDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelDebt.fulfilled, (state, action) => {
                state.loading = false;
                state.inDebt = action.payload;
            })
            .addCase(cancelDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to cancel debt";
            })
            .addCase(repayDebt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(repayDebt.fulfilled, (state, action) => {
                state.loading = false;
                state.isRepaySuccess = true;
            })
            .addCase(repayDebt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || "Failed to repay debt";
            });
    },
});

export const { selectDebt, toggleRepayModal } = debtSlice.actions;
export const debtReducer = debtSlice.reducer;
