import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllOrders, getOrderById } from './orderApi';
import { Order } from '../../types';

interface OrderState {
  isLoading: boolean;
  orders: any[];
  order: Order | null;
}

export interface RootState {
  orders: OrderState;
}

const initialState: OrderState = {
  isLoading: false,
  orders: [],
  order: null,
};

export const getAllOrdersAsync = createAsyncThunk(
  'orders/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllOrders();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

export const getOrderByIdAsync = createAsyncThunk(
  'orders/getOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const data = await getOrderById(orderId);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getUserOrdersAsync
      .addCase(getAllOrdersAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.data || [];
      })
      .addCase(getAllOrdersAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getOrderByIdAsync
      .addCase(getOrderByIdAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload?.data || null;
      })
      .addCase(getOrderByIdAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default ordersSlice.reducer;
