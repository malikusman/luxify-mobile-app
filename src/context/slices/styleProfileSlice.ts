import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StyleProfile } from '@/src/services/modules/styleProfile/styleProfileTypes';

export interface StyleProfileState {
    data: StyleProfile | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: StyleProfileState = {
    data: null,
    isLoading: false,
    error: null,
};

const styleProfileSlice = createSlice({
    name: 'styleProfile',
    initialState,
    reducers: {
        setStyleProfile: (state, action: PayloadAction<StyleProfile>) => {
            state.data = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearStyleProfile: (state) => {
            state.data = null;
            state.isLoading = false;
            state.error = null;
        },
    },
});

export const { setStyleProfile, setLoading, setError, clearStyleProfile } = styleProfileSlice.actions;
export default styleProfileSlice.reducer;

