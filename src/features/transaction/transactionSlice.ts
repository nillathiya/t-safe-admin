import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllIncomeTransaction,
  directTransferFund,
  getAdminFundTransaction,
} from './transactionApi';
import { FundTransaction, IncomeTransaction } from '../../types';

interface TransactionState {
  isLoading: boolean;
  incomeTransactionsLoading: boolean;
  transactions: [];
  incomeTransactions: IncomeTransaction[];
  adminFundTransactions:FundTransaction[];
}

const initialState: TransactionState = {
  isLoading: false,
  incomeTransactionsLoading: false,
  transactions: [],
  incomeTransactions: [],
  adminFundTransactions:[],
};

export const getAllIncomeTransactionAsync = createAsyncThunk(
  'transaction/getAllIncomeTransaction',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await getAllIncomeTransaction(formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

export const directTransferFundAsync = createAsyncThunk(
  'transaction/directTransferFund',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await directTransferFund(formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

export const getAdminFundTransactionAsync = createAsyncThunk(
  'transaction/getAdminFundTransaction',
  async (params: {txType:string}, { rejectWithValue }) => {
    try {
      const data = await getAdminFundTransaction(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllIncomeTransactionAsync
      .addCase(getAllIncomeTransactionAsync.pending, (state) => {
        state.incomeTransactionsLoading = true;
      })
      .addCase(getAllIncomeTransactionAsync.fulfilled, (state, action) => {
        state.incomeTransactionsLoading = false;
        state.incomeTransactions = action.payload.data;
      })
      .addCase(getAllIncomeTransactionAsync.rejected, (state) => {
        state.incomeTransactionsLoading = false;
      })
      // directTransferFundAsync
      .addCase(directTransferFundAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(directTransferFundAsync.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(directTransferFundAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getAdminFundTransactionAsync
      .addCase(getAdminFundTransactionAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdminFundTransactionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminFundTransactions = action.payload.data;
      })
      .addCase(getAdminFundTransactionAsync.rejected, (state) => {
        state.isLoading = false;
      })
  },
});

export default transactionSlice.reducer;

