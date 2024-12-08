import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setCacheToken } from "../../helper/cacheToken";

const destination_server = "http://localhost:3000";

export type AuthCredentials = {
    email: string;
    password: string;
}

interface AuthState {
    token: string | null;
    loading: boolean;
    approve: boolean;
    isSubmit: boolean;
    error: string | null; 
}

const initialState: AuthState = {
    token: null,
    loading: false,
    approve: false,
    isSubmit: false,
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

export const { logout } = sliceAuth.actions;
export const authReducer = sliceAuth.reducer;