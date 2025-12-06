import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OnboardingData {
    firstName: string;
    lastName: string;
    email: string;
    occupation: string;
    selectedBrands: string[];
}

interface OnboardingState {
    currentStep: number;
    totalSteps: number;
    data: OnboardingData;
    isCompleted: boolean;
}

const initialState: OnboardingState = {
    currentStep: 1,
    totalSteps: 4,
    data: {
        firstName: '',
        lastName: '',
        email: '',
        occupation: '',
        selectedBrands: [],
    },
    isCompleted: false,
};

const onboardingSlice = createSlice({
    name: 'onboarding',
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
        updateOnboardingData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
            state.data = { ...state.data, ...action.payload };
        },
        setOnboardingCompleted: (state) => {
            state.isCompleted = true;
        },
        resetOnboarding: (state) => {
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
    updateOnboardingData,
    setOnboardingCompleted,
    resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

