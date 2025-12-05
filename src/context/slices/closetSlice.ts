import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ClosetImage {
    id: string;
    uri: string;
    timestamp: number;
}

interface ClosetState {
    images: ClosetImage[];
    maxImages: number;
}

const initialState: ClosetState = {
    images: [],
    maxImages: 5,
};

const closetSlice = createSlice({
    name: 'closet',
    initialState,
    reducers: {
        addImage: (state, action: PayloadAction<string>) => {
            if (state.images.length < state.maxImages) {
                const newImage: ClosetImage = {
                    id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    uri: action.payload,
                    timestamp: Date.now(),
                };
                state.images.push(newImage);
            }
        },
        addMultipleImages: (state, action: PayloadAction<string[]>) => {
            const remainingSlots = state.maxImages - state.images.length;
            if (remainingSlots > 0) {
                const imagesToAdd = action.payload.slice(0, remainingSlots);
                const newImages: ClosetImage[] = imagesToAdd.map((uri) => ({
                    id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    uri,
                    timestamp: Date.now(),
                }));
                state.images.push(...newImages);
            }
        },
        removeImage: (state, action: PayloadAction<string>) => {
            state.images = state.images.filter((img) => img.id !== action.payload);
        },
        clearCloset: (state) => {
            state.images = [];
        },
    },
});

export const { addImage, addMultipleImages, removeImage, clearCloset } = closetSlice.actions;

export default closetSlice.reducer;

