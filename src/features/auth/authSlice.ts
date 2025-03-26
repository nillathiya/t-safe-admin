import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  adminLogin,
  adminLogout,
  adminChangePassword,
  requestImpersonationToken,
} from './authApi';
import { AdminUser } from '../../types';

// Define the AuthState interface
interface AuthState {
  loading: boolean;
  currentUser: AdminUser | null;
  errorMessage: string | null;
  isLoggedIn: boolean;
}

// Define the RootState type (use the correct type for your root state if it's different)
export interface RootState {
  auth: AuthState;
}

const initialState: AuthState = {
  loading: false,
  currentUser: null,
  errorMessage: null,
  isLoggedIn: false,
};

// Define the async thunk
// Define the async thunk
export const adminLoginAsync = createAsyncThunk(
  'auth/adminLogin',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await adminLogin(formData);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

export const adminLogoutAsync = createAsyncThunk(
  'auth/adminLogout',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminLogout();
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

export const adminChangePasswordAsync = createAsyncThunk(
  'auth/adminChangePassword',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await adminChangePassword(formData);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

export const requestImpersonationTokenAsync = createAsyncThunk(
  'auth/requestImpersonationToken',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await requestImpersonationToken(userId);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

// Define the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    clearUser(state) {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.errorMessage = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // admin login
      .addCase(adminLoginAsync.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(adminLoginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.data;
        state.isLoggedIn = true;
      })
      .addCase(adminLoginAsync.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload as string;
      })

      // adminLogoutAsync
      .addCase(adminLogoutAsync.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(adminLogoutAsync.fulfilled, (state, action) => {
        console.log('authSlice fulfilled', action.payload);
        state.loading = false;
        state.currentUser = null;
        state.isLoggedIn = false;
      })
      .addCase(adminLogoutAsync.rejected, (state, action) => {
        console.log('error mesasge', action.payload);
        state.loading = false;
        state.errorMessage = action.payload as string;
      })

      // adminChangePasswordAsync
      .addCase(adminChangePasswordAsync.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(adminChangePasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(adminChangePasswordAsync.rejected, (state, action) => {
        console.log('error mesasge', action.payload);
        state.loading = false;
        state.errorMessage = action.payload as string;
      })

      // requestImpersonationTokenAsync
      .addCase(requestImpersonationTokenAsync.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(requestImpersonationTokenAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestImpersonationTokenAsync.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload as string;
      });
  },
});

// Export the reducer and actions
export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

// Export selectors with state type
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectError = (state: RootState) => state.auth.errorMessage;
export const selectLoader = (state: RootState) => state.auth.loading;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
