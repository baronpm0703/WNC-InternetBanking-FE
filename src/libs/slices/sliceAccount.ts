import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type RecipientInfo = {
  account_number: string
  bank_id: string
  reminder_name: string
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
  employeeAccount?: AccountInfo[]
  error: string | null
  selectedTargetData?: TransactionTarget | null;
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

export const sliceAccount = createSlice({
  initialState,
  name: "account",
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAccountInfo.fulfilled, (state, action: slicePayload<AccountInfo>) => {
        console.log("Payload Account Info: ", action.payload);
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
  },
})

export const {} = sliceAccount.actions;
export const accountReducer = sliceAccount.reducer;