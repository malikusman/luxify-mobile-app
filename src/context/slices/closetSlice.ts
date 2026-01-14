import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ClosetImage {
    id: string;
    uri: string;
    timestamp: number;
}

export interface ClosetItem {
    id: string;
    imageUri: string;
    category?: string;
    itemName?: string;
    size?: string;
    color?: string;
    brandName?: string;
    fit?: string;
    timestamp: number;
}

interface ClosetState {
    images: ClosetImage[];
    items: ClosetItem[];
    maxImages: number;
}

const initialState: ClosetState = {
    images: [],
    items: [],
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
        saveItem: (state, action: PayloadAction<Omit<ClosetItem, 'id' | 'timestamp'>>) => {
            // Ensure items array exists (for backward compatibility with persisted state)
            if (!state.items) {
                state.items = [];
            }
            const newItem: ClosetItem = {
                id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                timestamp: Date.now(),
                ...action.payload,
            };
            state.items.push(newItem);
            // Also add to images if not already there
            if (!state.images.find(img => img.uri === newItem.imageUri)) {
                const newImage: ClosetImage = {
                    id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    uri: newItem.imageUri,
                    timestamp: Date.now(),
                };
                if (state.images.length < state.maxImages) {
                    state.images.push(newImage);
                }
            }
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        updateItem: (state, action: PayloadAction<ClosetItem>) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
    },
});

export const { addImage, addMultipleImages, removeImage, clearCloset, saveItem, removeItem, updateItem } = closetSlice.actions;

export default closetSlice.reducer;

