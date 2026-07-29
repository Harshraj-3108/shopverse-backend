// src/features/cart/cartSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartUiState {
  isCartOpen: boolean;
}

const initialState: CartUiState = {
  isCartOpen: false,
};

export const cartSlice = createSlice({
  name: 'cartUi',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },
  },
});

export const { toggleCart, openCart, closeCart, setCartOpen } = cartSlice.actions;

export default cartSlice.reducer;

export const selectIsCartOpen = (state: { cartUi: CartUiState }) => state.cartUi.isCartOpen;
