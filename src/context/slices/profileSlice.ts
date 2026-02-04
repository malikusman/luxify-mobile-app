import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    region: string;
    gender: string;
    occupation: string;
    occasion: string;
    favoriteColors: string[];
    selectedBrands: string[];
    dateOfBirth: string;
    height: string;
    size: string;
    budgetRange: string;
    bodyType: string;
    waist: string;
    hips: string;
    shoulders: string;
    chest: string;
    bodyHighlightAreas: string[];
}

interface ProfileState {
    currentStep: number;
    totalSteps: number;
    data: ProfileData;
    isCompleted: boolean;
}

const initialState: ProfileState = {
    currentStep: 1,
    totalSteps: 10,
    data: {
        firstName: '',
        lastName: '',
        email: '',
        region: '',
        gender: '',
        occupation: '',
        occasion: '',
        favoriteColors: [],
        selectedBrands: [],
        dateOfBirth: '',
        height: '',
        size: '',
        budgetRange: '',
        bodyType: '',
        waist: '',
        hips: '',
        shoulders: '',
        chest: '',
        bodyHighlightAreas: [],
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
            const payload = action.payload;
            const newData = { ...state.data };
            
            if (payload.favoriteColors) {
                newData.favoriteColors = [...payload.favoriteColors];
            }
            if (payload.selectedBrands) {
                newData.selectedBrands = [...payload.selectedBrands];
            }
            if (payload.bodyHighlightAreas) {
                newData.bodyHighlightAreas = [...payload.bodyHighlightAreas];
            }
            if (payload.firstName !== undefined) newData.firstName = payload.firstName;
            if (payload.lastName !== undefined) newData.lastName = payload.lastName;
            if (payload.email !== undefined) newData.email = payload.email;
            if (payload.region !== undefined) newData.region = payload.region;
            if (payload.gender !== undefined) newData.gender = payload.gender;
            if (payload.occupation !== undefined) newData.occupation = payload.occupation;
            if (payload.occasion !== undefined) newData.occasion = payload.occasion;
            if (payload.dateOfBirth !== undefined) newData.dateOfBirth = payload.dateOfBirth;
            if (payload.height !== undefined) newData.height = payload.height;
            if (payload.size !== undefined) newData.size = payload.size;
            if (payload.budgetRange !== undefined) newData.budgetRange = payload.budgetRange;
            if (payload.bodyType !== undefined) newData.bodyType = payload.bodyType;
            if (payload.waist !== undefined) newData.waist = payload.waist;
            if (payload.hips !== undefined) newData.hips = payload.hips;
            if (payload.shoulders !== undefined) newData.shoulders = payload.shoulders;
            if (payload.chest !== undefined) newData.chest = payload.chest;
            
            state.data = newData;
        },
        setProfileCompleted: (state) => {
            state.isCompleted = true;
        },
        resetProfile: (state) => {
            state.currentStep = 1;
            state.data = {
                firstName: '',
                lastName: '',
                email: '',
                region: '',
                gender: '',
                occupation: '',
                occasion: '',
                favoriteColors: [],
                selectedBrands: [],
                dateOfBirth: '',
                height: '',
                size: '',
                budgetRange: '',
                bodyType: '',
                waist: '',
                hips: '',
                shoulders: '',
                chest: '',
                bodyHighlightAreas: [],
            };
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

