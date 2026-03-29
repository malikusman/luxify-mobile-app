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
    has_style_profile: boolean | null;
}

const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    user: null,
    userProfile: null,
    has_style_profile: null,
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
                has_style_profile?: boolean;
            }>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            if (action.payload.user) {
                state.user = action.payload.user;
            }
            if (action.payload.has_style_profile !== undefined) {
                state.has_style_profile = action.payload.has_style_profile;
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
            // Update has_style_profile if present in user profile
            if (action.payload.has_style_profile !== undefined) {
                state.has_style_profile = action.payload.has_style_profile;
            }
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.user = null;
            state.userProfile = null;
            state.has_style_profile = null;
        },
        clearAuth: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.user = null;
            state.userProfile = null;
            state.has_style_profile = null;
        },
        setHasStyleProfile: (state, action: PayloadAction<boolean>) => {
            state.has_style_profile = action.payload;
        },
    },
});

export const { setCredentials, setAccessToken, setRefreshToken, setUser, setUserProfile, logout, clearAuth, setHasStyleProfile } =
    authSlice.actions;
export default authSlice.reducer;

