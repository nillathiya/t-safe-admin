import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllIncomeTransaction,
  directTransferFund,
  getFundTransactions,
  updateUserFundTransaction,
} from './transactionApi';
import {
  IFundTransaction,
  IFundTransactionParams,
  IncomeTransaction,
  IUpdateUserFundTransactionPayload,
} from '../../types';

interface TransactionState {
  isLoading: boolean;
  incomeTransactionsLoading: boolean;
  transactions: [];
  incomeTransactions: IncomeTransaction[];
  fundTransactions: IFundTransaction[];
}

const initialState: TransactionState = {
  isLoading: false,
  incomeTransactionsLoading: false,
  transactions: [],
  incomeTransactions: [],
  fundTransactions: [],
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

export const getFundTransactionsAsync = createAsyncThunk(
  'transaction/getFundTransactions',
  async (params: IFundTransactionParams, { rejectWithValue }) => {
    try {
      const data = await getFundTransactions(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);
export const updateUserFundTransactionAsync = createAsyncThunk(
  'transaction/updateUserFundTransaction',
  async (
    {
      id,
      formData,
    }: { id: string; formData: IUpdateUserFundTransactionPayload },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateUserFundTransaction(id, formData);
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
      // getFundTransactionsAsync
      .addCase(getFundTransactionsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFundTransactionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fundTransactions = action.payload.data;
      })
      .addCase(getFundTransactionsAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // updateUserFundTransactionAsync
      .addCase(updateUserFundTransactionAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserFundTransactionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTransaction = action.payload.data;

        state.fundTransactions = state.fundTransactions.map((tx) =>
          tx._id === updatedTransaction._id ? updatedTransaction : tx,
        );
      })
      .addCase(updateUserFundTransactionAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default transactionSlice.reducer;
