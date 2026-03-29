import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/src/services/modules/conversations/conversationTypes';

/**
 * A Look contains products and optionally a lightX generated image URL
 */
export interface Look {
    products: Product[];
    /**
     * Optional grouped products (used for wardrobe + online-products combined case).
     * Each inner array represents a "row" of similar items (e.g. shoes row, bags row).
     */
    productGroups?: Product[][];
    /**
     * Optional titles for `productGroups` (same length/order).
     * Example: ["Option 1", "Option 2", ...]
     */
    groupTitles?: string[];
    lightXImageUrl?: string; // Generated image URL from lightX service
    lightXError?: string; // Error message if lightX generation failed
}

/**
 * Structure: { [conversationId]: { [messageId]: Look[] } }
 * This allows us to cache looks per conversation and per message
 * Each Look contains products and optionally a lightX image URL
 */
interface ConversationProductsState {
    // Key: conversationId, Value: { messageId: Look[] }
    [conversationId: string]: {
        [messageId: string]: Look[]; // Array of looks (max 3)
    };
}

const initialState: ConversationProductsState = {};

const conversationProductsSlice = createSlice({
    name: 'conversationProducts',
    initialState,
    reducers: {
        /**
         * Cache looks for a specific message in a conversation
         * Each look contains products and optionally a lightX image URL
         */
        setMessageProducts: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
                looks: Look[]; // Array of looks (max 3)
            }>
        ) => {
            const { conversationId, messageId, looks } = action.payload;
            
            // Initialize conversation if it doesn't exist
            if (!state[conversationId]) {
                state[conversationId] = {};
            }
            
            // Store looks for this message
            state[conversationId][messageId] = looks;
        },
        
        /**
         * Update lightX image URL for a specific look in a message
         */
        setLookLightXImage: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
                lookIndex: number;
                lightXImageUrl: string;
            }>
        ) => {
            const { conversationId, messageId, lookIndex, lightXImageUrl } = action.payload;
            
            if (state[conversationId] && state[conversationId][messageId] && state[conversationId][messageId][lookIndex]) {
                // Immer will handle creating a new reference
                state[conversationId][messageId][lookIndex].lightXImageUrl = lightXImageUrl;
                // Clear any previous error when image is successfully set
                delete state[conversationId][messageId][lookIndex].lightXError;
                console.log(`Redux: Updated lightX image for ${conversationId}/${messageId}/look[${lookIndex}]:`, lightXImageUrl);
            } else {
                console.warn(`Redux: Cannot update lightX image - state not found for ${conversationId}/${messageId}/look[${lookIndex}]`);
            }
        },
        
        /**
         * Set error message for a specific look in a message
         */
        setLookLightXError: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
                lookIndex: number;
                error: string;
            }>
        ) => {
            const { conversationId, messageId, lookIndex, error } = action.payload;
            
            if (state[conversationId] && state[conversationId][messageId] && state[conversationId][messageId][lookIndex]) {
                state[conversationId][messageId][lookIndex].lightXError = error;
                console.log(`Redux: Set lightX error for ${conversationId}/${messageId}/look[${lookIndex}]:`, error);
            } else {
                console.warn(`Redux: Cannot set lightX error - state not found for ${conversationId}/${messageId}/look[${lookIndex}]`);
            }
        },
        
        /**
         * Cache looks for multiple messages at once
         */
        setMultipleMessageProducts: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageProducts: Array<{
                    messageId: string;
                    looks: Look[]; // Array of looks (max 3)
                }>;
            }>
        ) => {
            const { conversationId, messageProducts } = action.payload;
            
            // Initialize conversation if it doesn't exist
            if (!state[conversationId]) {
                state[conversationId] = {};
            }
            
            // Store looks for each message
            messageProducts.forEach(({ messageId, looks }) => {
                state[conversationId][messageId] = looks;
            });
        },
        
        /**
         * Clear products for a specific message
         */
        clearMessageProducts: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
            }>
        ) => {
            const { conversationId, messageId } = action.payload;
            if (state[conversationId] && state[conversationId][messageId]) {
                delete state[conversationId][messageId];
            }
        },
        
        /**
         * Clear all products for a conversation
         */
        clearConversationProducts: (
            state,
            action: PayloadAction<{
                conversationId: string;
            }>
        ) => {
            const { conversationId } = action.payload;
            if (state[conversationId]) {
                delete state[conversationId];
            }
        },
        
        /**
         * Clear all cached products
         */
        clearAllProducts: (state) => {
            Object.keys(state).forEach((conversationId) => {
                delete state[conversationId];
            });
        },
    },
});

export const {
    setMessageProducts,
    setLookLightXImage,
    setLookLightXError,
    setMultipleMessageProducts,
    clearMessageProducts,
    clearConversationProducts,
    clearAllProducts,
} = conversationProductsSlice.actions;

export default conversationProductsSlice.reducer;

