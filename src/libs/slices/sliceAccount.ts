import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type AccountInfo = {
  name: string
  email: string
  account_balance: number
  account_number: string
  created_at?: string
  role: string
}

export type Account = {
  accountInfo: AccountInfo
  customerAccount?: AccountInfo[]
  employeeAccount?: AccountInfo[]
  error: string | null
}

const initialState: Account = {
  accountInfo: { name: "", email: "", account_balance: 0, account_number: "", role: "Customer" },
  error: null
}
export interface slicePayload<T> {
  payload: T;
  type: string;
}

export const fetchAccountInfo = createAsyncThunk(
  "account/fetch",
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiClient.get("accounts/account-imp-info");
      // Return token or other response data
      return response.data; // Axios automatically parses JSON
    } catch (error: any) {
      console.error("Account info error: ",error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
    );
    }
  }
)

export const fetchCustomerAccount = createAsyncThunk(
  "customer-account/fetch",
  async (_, {rejectWithValue}) => {
    try {
      const response = await apiClient.get("accounts/customersList");
      // Return token or other response data
      return response.data; // Axios automatically parses JSON
    } catch (error: any) {
      console.error("Customer Account info error: ",error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
    );
    }
  }
)
export const sliceAccount = createSlice({
  initialState,
  name: "account",
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAccountInfo.fulfilled, (state, action: slicePayload<AccountInfo>) => {
        state.accountInfo = action.payload;
        state.error = ""
      })
      .addCase(fetchAccountInfo.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Account info error: ", action.payload);
      })
      .addCase(fetchCustomerAccount.pending, (state) => {
        state.customerAccount = [];
        state.error = ""
      })
      .addCase(fetchCustomerAccount.fulfilled, (state, action: slicePayload<object[]>) => {
        let temp = action.payload;
        state.customerAccount = temp.map((item: any) => {
          return {
            name: item.name,
            email: item.email,
            phone: item.phone,
            account_balance: item.payment_account_id.account_balance,
            account_number: item.payment_account_id.account_number,
            role: item.role,
            created_at: item.created_at
          }
        })
        state.error = ""
      })
  },
})

export const {} = sliceAccount.actions;
export const accountReducer = sliceAccount.reducer;