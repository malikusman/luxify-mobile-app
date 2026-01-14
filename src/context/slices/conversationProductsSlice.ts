import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/src/services/modules/conversations/conversationTypes';

/**
 * Structure: { [conversationId]: { [messageId]: Product[] } }
 * This allows us to cache products per conversation and per message
 */
interface ConversationProductsState {
    // Key: conversationId, Value: { messageId: Product[] }
    [conversationId: string]: {
        [messageId: string]: Product[];
    };
}

const initialState: ConversationProductsState = {};

const conversationProductsSlice = createSlice({
    name: 'conversationProducts',
    initialState,
    reducers: {
        /**
         * Cache products for a specific message in a conversation
         */
        setMessageProducts: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
                products: Product[];
            }>
        ) => {
            const { conversationId, messageId, products } = action.payload;
            
            // Initialize conversation if it doesn't exist
            if (!state[conversationId]) {
                state[conversationId] = {};
            }
            
            // Store products for this message
            state[conversationId][messageId] = products;
        },
        
        /**
         * Cache products for multiple messages at once
         */
        setMultipleMessageProducts: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageProducts: Array<{
                    messageId: string;
                    products: Product[];
                }>;
            }>
        ) => {
            const { conversationId, messageProducts } = action.payload;
            
            // Initialize conversation if it doesn't exist
            if (!state[conversationId]) {
                state[conversationId] = {};
            }
            
            // Store products for each message
            messageProducts.forEach(({ messageId, products }) => {
                state[conversationId][messageId] = products;
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
    setMultipleMessageProducts,
    clearMessageProducts,
    clearConversationProducts,
    clearAllProducts,
} = conversationProductsSlice.actions;

export default conversationProductsSlice.reducer;

