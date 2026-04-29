import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderDetail } from '@/types';

interface OrderState {
  orders: Order[];
  currentOrder: OrderDetail | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
}

const initialState: OrderState = {
  orders:       [],
  currentOrder: null,
  isLoading:    false,
  totalPages:   1,
  currentPage:  1,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<{ orders: Order[]; totalPages: number; currentPage: number; }>) => {
      state.orders      = action.payload.orders;
      state.totalPages  = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.isLoading   = false;
    },

    setCurrentOrder: (state, action: PayloadAction<OrderDetail>) => {
      state.currentOrder = action.payload;
      state.isLoading    = false;
    },

    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
});

export const {
  setOrders,
  setCurrentOrder,
  setOrderLoading,
  clearCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;