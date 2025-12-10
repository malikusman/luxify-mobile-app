import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/src/services/modules/auth/authTypes';

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    user: {
        id: string;
        email: string;
        name?: string;
    } | null;
    userProfile: UserProfile | null;
}

const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    user: null,
    userProfile: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                accessToken: string;
                refreshToken: string | null;
                user?: AuthState['user'];
            }>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            if (action.payload.user) {
                state.user = action.payload.user;
            }
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
        setRefreshToken: (state, action: PayloadAction<string>) => {
            state.refreshToken = action.payload;
        },
        setUser: (state, action: PayloadAction<AuthState['user']>) => {
            state.user = action.payload;
        },
        setUserProfile: (state, action: PayloadAction<UserProfile>) => {
            state.userProfile = action.payload;
            // Also update the basic user info for backward compatibility
            state.user = {
                id: action.payload.id,
                email: action.payload.email,
                name: `${action.payload.first_name} ${action.payload.last_name}`,
            };
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.user = null;
            state.userProfile = null;
        },
        clearAuth: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.user = null;
            state.userProfile = null;
        },
    },
});

export const { setCredentials, setAccessToken, setRefreshToken, setUser, setUserProfile, logout, clearAuth } =
    authSlice.actions;
export default authSlice.reducer;

