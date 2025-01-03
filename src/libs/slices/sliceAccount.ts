import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";;

export type RecipientInfo = {
  account_number: string
  bank_id: string
  reminder_name: string
}
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
  role: string
  recipient_list?: RecipientInfo[]
  indebt_list?: string[]
  phone: string
}

export type TransactionTarget = {
  account_number: string;
  name: string;
};

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
  selectedTargetData?: TransactionTarget | null;
  successMessage?: string | null;
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
  error: null
}
export interface slicePayload<T> {
  payload: T;
  type: string;
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

export const updateAccountInfo = createAsyncThunk(
  "account/updateInfor",
  async (recipientData: { name: string; email: string; phone: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/accounts/update-info", recipientData);
      return response.data;
    } catch (error: any) {
      console.error("Error updating recipient:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to update infor.");
    }
  }
);

export const changePasswordWhenLoggedin = createAsyncThunk(
  "account/changePasswordAccount",
  async (
    { old_password, password }: { old_password: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Payload being sent:", { old_password, password });
      const response = await apiClient.post(
        "/accounts/change-password-when-logged-in",
        { old_password, password }
      );
      console.log("Server Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Internal Server Error Details:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password."
      );
    }
  }
);

export const fetchAccountInfo = createAsyncThunk(
  "account/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("accounts/account-imp-info");
      // Return token or other response data
      return response.data; // Axios automatically parses JSON
    } catch (error: any) {
      console.error("Account info error: ", error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
      );
    }
  }
)

export const fetchCustomerAccount = createAsyncThunk(
  "customer-account/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("accounts/customersList");
      // Return token or other response data
      return response.data; // Axios automatically parses JSON
    } catch (error: any) {
      console.error("Customer Account info error: ", error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
      );
    }
  }
)

export const fetchTransactionTarget = createAsyncThunk(
  "account/fetchTransactionTarget",
  async (accountNumber: string, { rejectWithValue }) => {
    try {
      if (!accountNumber || accountNumber.trim() === "") {
        throw new Error("Account number is required.");
      }
      const response = await apiClient.get(`/accounts/transaction-target`, {
        params: { account_number: accountNumber },
      });

      if (!response.data || !response.data.target_data) {
        throw new Error("Invalid response from server.");
      }
      return response.data.target_data;
    } catch (error: any) {
      console.error("Transaction target fetch error: ", error);
      return rejectWithValue(
        error.response?.data?.message || "An unexpected error occurred"
      );
    }
  }
);

export const fetchRecipients = createAsyncThunk(
  "account/fetchRecipients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/accounts/recipients");
      return response.data; // Assuming response.data contains recipient list
    } catch (error: any) {
      console.error("Error fetching recipient list:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recipient list."
      );
    }
  }
);

export const saveBeneficiary = createAsyncThunk(
  "account/saveBeneficiary",
  async (beneficiaryData: { account_number: string; bank_id: string; reminder_name: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/accounts/save-recipient`, beneficiaryData);
      return response.data;
    } catch (error: any) {
      console.error("Error saving beneficiary:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to save beneficiary.");
    }
  }
);
export const depositCustomer = createAsyncThunk(
  "customer-account/deposit",
  async (data: DepositInfo, { rejectWithValue }) => {
    try {
      console.log("Deposit data: ", data);
      const response = await apiClient.post("employee/deposit", data);
      // Return token or other response data
      return response.data; // Axios automatically parses JSON
    } catch (error: any) {
      console.error("Deposit error: ", error);
      return rejectWithValue(
        error.response?.data || "An unexpected error occurred"
      );
    }
  }
)

export const employeeCreateAccount = createAsyncThunk(
  "employee/createAccount",
  async (data: CreateAccountType, { rejectWithValue }) => {
    try {
      console.log("Create account data: ", data);
      const response = await apiClient.post("employee/create-customer-account", data);
      if (response.status === 200) {
        return true;
      }
    } catch (error: any) {
      console.error("Create customer account error: ", error);
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
      .addCase(fetchTransactionTarget.fulfilled, (state, action) => {
        console.log("API Data Fetched Successfully:", action.payload); // Debug dữ liệu trả về
        state.selectedTargetData = action.payload;
        state.error = "";
      })
      .addCase(fetchTransactionTarget.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Transaction target error: ", action.payload);
      })
      .addCase(fetchRecipients.fulfilled, (state, action: slicePayload<RecipientInfo[]>) => {
        console.log("Recipient list fetched successfully:", action.payload);
        state.accountInfo.recipient_list = action.payload; // Save recipients to state
        state.error = null;
      })
      .addCase(fetchRecipients.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Error fetching recipient list:", action.payload);
      })
      .addCase(saveBeneficiary.fulfilled, (state, action: slicePayload<RecipientInfo>) => {
        console.log("Beneficiary saved successfully:", action.payload);
        if (state.accountInfo.recipient_list) {
          state.accountInfo.recipient_list.push(action.payload);
        } else {
          state.accountInfo.recipient_list = [action.payload];
        }
        state.error = null;
      })
      .addCase(saveBeneficiary.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Error saving beneficiary:", action.payload);
      })
      .addCase(updateAccountInfo.fulfilled, (state, action: slicePayload<AccountInfo>) => {
        console.log("Account updated successfully:", action.payload);
        state.accountInfo = { ...state.accountInfo, ...action.payload }; // Cập nhật thông tin account
        state.error = null;
      })
      .addCase(updateAccountInfo.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Error updating account:", action.payload);
      })
      .addCase(changePasswordWhenLoggedin.fulfilled, (state) => {
        console.log("Password changed successfully");
        state.error = null;
      })
      .addCase(changePasswordWhenLoggedin.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Error changing password:", action.payload);
      })
      .addCase(createDebtRemind.fulfilled, (state) => {
        state.successMessage = "Debt remind created successfully!";
        state.error = null;
      })
      .addCase(createDebtRemind.rejected, (state, action) => {
        state.error = action.payload as string;
        state.successMessage = null;
      })
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