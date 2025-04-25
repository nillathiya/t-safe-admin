import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllWithdrawal, updateWithdrawalRequest } from './withdrawalApi';
import { IFundTransaction } from '../../types';

interface WithdrawalState {
  isLoading: boolean;
  withdrawals: IFundTransaction[];
  totalWithdrawals: number | null;
  withdrawal: any;
}

export interface RootState {
  withdrawal: WithdrawalState;
}

const initialState: WithdrawalState = {
  isLoading: false,
  withdrawal: null,
  withdrawals: [],
  totalWithdrawals: null,
};

export const fetchWithdrawals = createAsyncThunk(
  'withdrawals/fetchWithdrawals',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllWithdrawal();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

export const updateWithdrawalRequestAsync = createAsyncThunk(
  'withdrawals/updateWithdrawalRequest',
  async (
    {
      id,
      formData,
    }: { id: string; formData: { status: number; reason: string } },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateWithdrawalRequest(id, formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

const withdrawalSlice = createSlice({
  name: 'withdrawal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWithdrawals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.withdrawals = action.payload.data;
        state.totalWithdrawals = action.payload.total;
      })
      .addCase(fetchWithdrawals.rejected, (state) => {
        state.isLoading = false;
      })
      // updateWithdrawalRequestAsync
      .addCase(updateWithdrawalRequestAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateWithdrawalRequestAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedWithdrawal = action.payload.data;

        state.withdrawals = state.withdrawals.map((withdrawal) =>
          withdrawal._id === updatedWithdrawal._id
            ? updatedWithdrawal
            : withdrawal,
        );
      })
      .addCase(updateWithdrawalRequestAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default withdrawalSlice.reducer;

export const selectPendingWithdrawals = (state: RootState) =>
  state.withdrawal.withdrawals.filter(
    (withdrawal: any) => withdrawal.status === 0,
  );
export const selectApprovedWithdrawals = (state: RootState) =>
  state.withdrawal.withdrawals.filter((withdrawal) => withdrawal.status === 1);
export const selectCancelledWithdrawals = (state: RootState) =>
  state.withdrawal.withdrawals.filter((withdrawal) => withdrawal.status === 2);
