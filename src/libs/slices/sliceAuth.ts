import apiClient from "@/helper/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const destination_server = "http://localhost:3000";

export type AuthCredentials = {
    email: string;
    password: string;
}

export type AuthToken = {
    access_token: string;
    refresh_token: string;
}

export interface pathPayload {
    payload: AuthRoutes;
    type: string;
}
export interface slicePayload<T> {
    payload: T;
    type: string;
}
// Define the enum for the authentication process
export enum AuthRoutes {
    LOGIN = "Login",
    FORGOT_PASSWORD = "Forgot Password",
    VERIFY_CODE = "Verify Code",
    RESET_PASSWORD = "Reset Password",
}

export const AuthRouteDescriptions: { [key in AuthRoutes]: string } = {
    [AuthRoutes.LOGIN]: "Welcome back! Please log in to access your account.",
    [AuthRoutes.FORGOT_PASSWORD]: "Don’t worry, happens to all of us. Enter your email below to recover your password",
    [AuthRoutes.VERIFY_CODE]: "An authentication code has been sent to your email.",
    [AuthRoutes.RESET_PASSWORD]: "Your previous password has been resetted. Please set a new password for your account.",
};

interface AuthState {
    token: AuthToken | null;
    loading: boolean;
    approve: boolean;
    path: AuthRoutes;
    description: string;
    isSubmit: boolean;
    error: string | null; 
}

const initialState: AuthState = {
    token: null,
    loading: false,
    approve: false,
    isSubmit: false,
    path: AuthRoutes.LOGIN,
    description: AuthRouteDescriptions[AuthRoutes.LOGIN],
    error: null,
}

export const submitInfo = createAsyncThunk(
    "auth/submitInfo",
    async (credentials: AuthCredentials, {rejectWithValue}) => {
        try {
            const { email, password } = credentials;

            // Simulate delay for testing
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const body = { email, password };
            const response = await apiClient.post("accounts/sign-in", body);

            // Return token or other response data
            return response.data; // Axios automatically parses JSON
        } catch (error: any) {
            // Handle errors and return a rejected value
            console.log("error: ", error)
            return rejectWithValue(
                error.response?.data || "An unexpected error occurred"
            );
        }
    }
)

export const submitRefreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_: void, {rejectWithValue}) => {
        try {
            // Simulate delay for testing
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await apiClient.get("accounts/hello");

            // Return token or other response data
            return response.data; // Axios automatically parses JSON
        } catch (error: any) {
            // Handle errors and return a rejected value
            console.log("error: ", error)
            return rejectWithValue(
                error.response?.data || "An unexpected error occurred"
            );
        }
    }
)

export const sliceAuth = createSlice({
    initialState,
    name: "auth",
    reducers: {
        logout: (state) => {
            state.token = null;
            state.error = null;
            state.loading = false;
            window.location.href = "/";
        },
        setPath: (state, action: pathPayload) => {
            state.path = action.payload;
            state.description = AuthRouteDescriptions[action.payload];
        },
        newToken: (state, action: slicePayload<AuthToken>) => {
            state.token = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitInfo.fulfilled, (state, action) => {
                state.token = action.payload;
                state.loading = false;
                state.approve = true;
                state.error = null;
                localStorage.setItem("token", JSON.stringify(action.payload));
            })
            .addCase(submitInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.log(action.payload);
            })
            .addCase(submitRefreshToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitRefreshToken.fulfilled, (state, action) => {
                state.loading = false;
                state.approve = true;
                console.log(action.payload);
            })
            .addCase(submitRefreshToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.log(action.payload);
            })
    }
})

export const { logout, setPath, newToken } = sliceAuth.actions;
export const authReducer = sliceAuth.reducer;