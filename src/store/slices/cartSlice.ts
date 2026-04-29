import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart } from '@/types';

interface CartState {
  cart:      Cart | null;
  isOpen:    boolean; // controls cart drawer open/close
  isLoading: boolean;
}

const initialState: CartState = {
  cart:      null,
  isOpen:    false,
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart      = action.payload;
      state.isLoading = false;
    },

    clearCart: (state) => {
      state.cart = null;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCart,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
  setCartLoading,
} = cartSlice.actions;

export default cartSlice.reducer;