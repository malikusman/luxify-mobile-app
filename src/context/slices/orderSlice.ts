import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
    id: string;
    image: any;
    title: string;
    description: string;
    price: string;
    brand?: string;
}

interface OrderState {
    selectedProduct: Product | null;
}

const initialState: OrderState = {
    selectedProduct: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setSelectedProduct: (state, action: PayloadAction<Product>) => {
            state.selectedProduct = action.payload;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
    },
});

export const { setSelectedProduct, clearSelectedProduct } = orderSlice.actions;

export default orderSlice.reducer;

