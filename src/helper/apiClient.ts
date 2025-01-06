import { AuthToken, destination_server, newToken } from "@/libs/slices/sliceAuth";
import { root } from "@/libs/store";
import axios from "axios";
const VITE_DESTINATION_SERVER = import.meta.env.VITE_DESTINATION_SERVER
console.log("REACT_APP_DESTINATION_SERVER: ", VITE_DESTINATION_SERVER)
// Create Axios instance
const apiClient = axios.create({
  baseURL: VITE_DESTINATION_SERVER, // Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for refreshing tokens
apiClient.interceptors.request.use(
  async (config) => {
    const state = root.getState();
    const token: AuthToken | null = state.auth.token;
    if (token?.access_token) {
      config.headers["Authorization"] = `Bearer ${token.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const state = root.getState();
    const localToken = localStorage.getItem("token");
    const token: AuthToken | null = state.auth.token ? state.auth.token : localToken ? JSON.parse(localToken) : null;
    if (error.response?.status === 401) console.log("AccessToken expired: ", token, error.response);
    // Check if error is due to token expiration
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      token?.refresh_token
    ) {
      originalRequest._retry = true;

      // Attempt to refresh the token
      try {
        const refreshToken = token.refresh_token;
        const response = await axios.post(`${destination_server}/accounts/refresh-auth`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        });

        // Update tokens in localStorage
        console.log("Refresh tokens: ", response.data);
        root.dispatch(newToken(response.data));

        // Retry the original request
        originalRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        console.log("Refresh token failed: ", err);
        window.location.href = "/"; // Navigate to login page
        localStorage.removeItem("token");
        return Promise.reject(err);
      }
    }
    console.log("Error: ", error);
    return Promise.reject(error);
  }
);

export default apiClient;
