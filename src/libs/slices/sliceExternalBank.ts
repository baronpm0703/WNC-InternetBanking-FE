import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "@/helper/apiClient";

export type ExternalBank = {
    bank_id: string;
    name: string;
    public_key: string;
};

export type ExternalBanksState = {
    banks: ExternalBank[];
    loading: boolean;
    error: string | null;
};

const initialState: ExternalBanksState = {
    banks: [],
    loading: false,
    error: null,
};

export type ExternalAccountResponse = {
    account_number: string;
    name: string;
};

// Async thunk to fetch external banks
export const fetchExternalBanks = createAsyncThunk(
    "externalBanks/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get("/external-banks/getAllExternalBanks");
            return response.data;
        } catch (error: any) {
            console.error("Error fetching external banks:", error);
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch external banks."
            );
        }
    }
);

export const fetchExternalAccount = createAsyncThunk<
    ExternalAccountResponse,
    { account_number: string; bank_id: string },
    { rejectValue: string }
>(
    "external/fetchAccount",
    async ({ account_number, bank_id }, { rejectWithValue }) => {
        console.log("Fetching external account with:", { account_number, bank_id });
        if (!account_number || !bank_id) {
            console.error("Invalid parameters. 'account_number' and 'bank_id' are required.");
            return rejectWithValue("Invalid parameters. Please provide account number and bank ID.");
        }
        try {
            const response = await apiClient.post(
                "/api/get-external-account",
                { account_number },
                {
                    headers: {
                        "x-client-id": bank_id,
                    },
                }
            );

            console.log("External account fetched successfully:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching external account:", error);

            if (error.code === "ERR_NETWORK") {
                return rejectWithValue("Network error. Please check your connection.");
            }

            if (error.response?.status === 400) {
                return rejectWithValue(error.response.data?.message || "Bad request. Please check your input.");
            }

            if (error.response?.status === 404) {
                return rejectWithValue("Account not found. Please verify the account number.");
            }

            return rejectWithValue(error.response?.data?.message || "Failed to fetch external account.");
        }
    }
);

export const fetchBankById = createAsyncThunk(
    "externalBanks/fetchById",
    async (bank_id: string, { rejectWithValue }) => {
      if (!bank_id) {
        console.error("Invalid parameter: 'bank_id' is required.");
        return rejectWithValue("Invalid parameter: Bank ID is required.");
      }
  
      try {
        console.log(`Fetching bank details for bank_id: ${bank_id}`);
        const response = await apiClient.get(
          `/external-banks/getExternalBankByUserById/${bank_id}`
        );
  
        if (!response.data || !response.data.name) {
          console.error(
            `Unexpected response for bank_id: ${bank_id}. Response data is missing or invalid.`
          );
          return rejectWithValue("Invalid response from the server.");
        }
  
        console.log(`Successfully fetched bank details: ${response.data}`);
        return response.data; // This contains { bank_id, name }
      } catch (error: any) {
        console.error("Error fetching bank by ID:", error);
  
        if (error.response) {
          // Handle known HTTP errors
          const { status, data } = error.response;
          if (status === 400) {
            return rejectWithValue(data?.message || "Invalid request.");
          }
          if (status === 404) {
            return rejectWithValue("Bank not found. Please check the Bank ID.");
          }
          if (status === 500) {
            return rejectWithValue("Internal server error. Please try again later.");
          }
        } else if (error.code === "ERR_NETWORK") {
          // Handle network issues
          return rejectWithValue("Network error. Please check your connection.");
        }
  
        // Handle other unexpected errors
        return rejectWithValue("Failed to fetch bank by ID. Please try again.");
      }
    }
  );  

// Slice
export const externalBanksSlice = createSlice({
    name: "externalBanks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExternalBanks.fulfilled, (state, action) => {
                state.loading = false;
                state.banks = action.payload;
            })
            .addCase(fetchExternalBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.log("fetch external error")
            })
            .addCase(fetchExternalAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExternalAccount.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchExternalAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch bank by ID
            .addCase(fetchBankById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBankById.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(fetchBankById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const externalBanksReducer = externalBanksSlice.reducer;
