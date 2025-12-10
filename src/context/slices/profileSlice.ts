import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    occupation: string;
    occasion: string;
    selectedBrands: string[];
}

interface ProfileState {
    currentStep: number;
    totalSteps: number;
    data: ProfileData;
    isCompleted: boolean;
}

const initialState: ProfileState = {
    currentStep: 1,
    totalSteps: 7,
    data: {
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        occupation: '',
        occasion: '',
        selectedBrands: [],
    },
    isCompleted: false,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        },
        nextStep: (state) => {
            if (state.currentStep < state.totalSteps) {
                state.currentStep += 1;
            }
        },
        previousStep: (state) => {
            if (state.currentStep > 1) {
                state.currentStep -= 1;
            }
        },
        updateProfileData: (state, action: PayloadAction<Partial<ProfileData>>) => {
            state.data = { ...state.data, ...action.payload };
        },
        setProfileCompleted: (state) => {
            state.isCompleted = true;
        },
        resetProfile: (state) => {
            state.currentStep = 1;
            state.data = initialState.data;
            state.isCompleted = false;
        },
    },
});

export const {
    setCurrentStep,
    nextStep,
    previousStep,
    updateProfileData,
    setProfileCompleted,
    resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;

