import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";;

export type DepositInfo = {
  amount: number
  account_number: string
  email: string
  remarks: string
}

export type AccountInfo = {
  name: string
  email: string
  account_balance: number
  account_number: string
  created_at?: string
  phone: string
  role: string
}

export type Account = {
  accountInfo: AccountInfo
  customerAccount?: AccountInfo[]
  selectedCustomer?: AccountInfo | null
  depositSuccess?: boolean
  loading?: boolean
  employeeAccount?: AccountInfo[]
  statusCreateCusAccount?: "Pending" | "Success" | "Failed"
  createError?: string
  error: string | null
}

export type CreateAccountType = {
  role: string,
  username: string,
  password: string
  email: string,
  phone: string,
  name: string
}

const initialState: Account = {
  accountInfo: { name: "", email: "", account_balance: 0, account_number: "", role: "Customer", phone: "" },
  error: null,
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

export const depositCustomer = createAsyncThunk(
  "customer-account/deposit",
  async (data: DepositInfo, {rejectWithValue}) => {
    try {
      console.log("Deposit data: ", data);
      const response = await apiClient.post("employee/deposit", data);
      // Return token or other response data
      return response.data; // Axios automatically parses JSON
    } catch (error: any) {
      console.error("Deposit error: ",error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
    );
    }
  }
)

export const employeeCreateAccount = createAsyncThunk(
  "employee/createAccount",
  async (data: CreateAccountType, {rejectWithValue}) => {
    try {
      console.log("Create account data: ", data);
      const response = await apiClient.post("employee/create-customer-account", data);
      if (response.status === 200) {
        return true;
      }
    } catch (error: any) {
      console.error("Create customer account error: ",error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
    );
    }
  }
)

export const sliceAccount = createSlice({
  initialState,
  name: "account",
  reducers: {
    selectCustomerById: (state, action: slicePayload<number>) => {
      const index = action.payload;
      state.selectedCustomer = state.customerAccount ? state.customerAccount[index] : null;
    },
    selectCustomer: (state, action: slicePayload<AccountInfo>) => {
      state.selectedCustomer = action.payload || null;
    },
    resetSelected: (state) => {
      state.selectedCustomer = null;
      state.depositSuccess = false;
      state.error = ""
    }
  },
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
        console.log("Customer Account info: ", state.customerAccount);
      })
      .addCase(fetchCustomerAccount.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Customer Account info error: ", action.payload);
      })
      .addCase(depositCustomer.pending, (state) => {
        state.depositSuccess = false;
        state.loading = true,
        state.error = ""
      })
      .addCase(depositCustomer.fulfilled, (state, action) => {
        console.log("Deposit success: ", action.payload);
        state.depositSuccess = true;
        state.loading = false;
        state.error = ""
      })
      .addCase(depositCustomer.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
        state.depositSuccess = false;
        console.error("Deposit error: ", action.payload);
      })
      .addCase(employeeCreateAccount.pending, (state) => {
        state.statusCreateCusAccount = "Pending";
      })
      .addCase(employeeCreateAccount.fulfilled, (state) => {
        state.statusCreateCusAccount = "Success";
      })
      .addCase(employeeCreateAccount.rejected, (state, action) => {
        state.statusCreateCusAccount = "Failed";
        state.createError = action.payload as string;
        console.error("Create customer account error: ", action.payload);
      })
  },
})

export const { selectCustomer, resetSelected, selectCustomerById } = sliceAccount.actions;
export const accountReducer = sliceAccount.reducer;