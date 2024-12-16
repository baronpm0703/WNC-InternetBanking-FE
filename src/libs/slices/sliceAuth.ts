import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const destination_server = "http://localhost:3000";

export type AuthCredentials = {
    email: string;
    password: string;
}

export interface pathPayload {
    payload: AuthRoutes;
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
    token: string | null;
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

export const submit = createAsyncThunk(
    'auth/submit',
    async (credentials: {email: string, password: string}, {rejectWithValue}) => {
        console.log("Verify with: ", credentials);
        await new  Promise((resolve) => setTimeout(resolve, 500));
        let body = {
            username: credentials.email,
            password: credentials.password
        }
        let response = await fetch(`${destination_server}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        let data = await response.json();
        if (response.ok) {
            return data.access_token;
        }
        return rejectWithValue("Login failed");
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
        },
        setPath: (state, action: pathPayload) => {
            state.path = action.payload;
            state.description = AuthRouteDescriptions[action.payload];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(submit.pending, (state) => {
                state.loading = true;
                state.isSubmit = true;
                state.error = null;
            })
            .addCase(submit.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload;
                state.approve = true;
                state.error = null;
                localStorage.setItem("token", action.payload);
                let {email, password} = action.payload;
                console.log("Approve Login with: ", email, password);
            })
            .addCase(submit.rejected, (state, action) => {
                state.loading = false;
                state.error = "Login failed";
                state.approve = false;
                console.log("Login failed with: ", action.payload);
            })
    }
})

export const { logout, setPath } = sliceAuth.actions;
export const authReducer = sliceAuth.reducer;