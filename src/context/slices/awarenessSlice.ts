import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AwarenessState {
    hasSeenAwareness: boolean;
}

const initialState: AwarenessState = {
    hasSeenAwareness: false,
};

const awarenessSlice = createSlice({
    name: 'awareness',
    initialState,
    reducers: {
        setAwarenessSeen: (state) => {
            state.hasSeenAwareness = true;
        },
        resetAwareness: (state) => {
            state.hasSeenAwareness = false;
        },
    },
});

export const { setAwarenessSeen, resetAwareness } = awarenessSlice.actions;
export default awarenessSlice.reducer;

