import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CryptoJS from 'crypto-js';
import { IContactUs, Pagination } from '../../types';
import {
  getAllUser,
  getAllUserUpdate,
  getUserById,
  updateUserProfile,
  checkUsername,
  getContactMessages,
  changeConatctMesasgeStatus,
  getUserGenerationTree,
  getUserDetailsWithInvestmentInfo,
  AddNewMember,
} from './userApi';
import { CRYPTO_SECRET_KEY } from '../../constants';

interface UserState {
  user: any;
  users: any[];
  updateUsers: any[];
  isLoading: boolean;
  pagination: Pagination | null;
  contactMessages: IContactUs[];
  userGenerationTree: any[];
}

export interface RootState {
  users: UserState;
}

const initialState: UserState = {
  user: [],
  users: [],
  updateUsers: [],
  isLoading: false,
  pagination: null,
  contactMessages: [],
  userGenerationTree: [],
};

// Async Thunks
export const getAllUserAsync = createAsyncThunk(
  'user/getAllUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllUser();
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const updateUserStatusAsync = createAsyncThunk(
  'user/getAllUserUpdate',
  async (
    payload: {
      userId: string;
      accountStatus: Partial<{ activeStatus: number; blockStatus: number }>;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await getAllUserUpdate(payload);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const getUserByIdAsync = createAsyncThunk(
  'user/getUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await getUserById(userId);
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
export const updateUserProfileAsync = createAsyncThunk(
  'user/updateUserProfile',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await updateUserProfile(formData);
      return data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

export const checkUsernameAsync = createAsyncThunk(
  'user/checkUsername',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await checkUsername(formData);
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

export const getContactMessagesAsync = createAsyncThunk(
  'user/getContactMessages',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getContactMessages();
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

export const changeConatctMesasgeStatusAsync = createAsyncThunk(
  'user/changeConatctMesasgeStatus',
  async (formData: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const data = await changeConatctMesasgeStatus(formData);
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

export const getUserGenerationTreeAsync = createAsyncThunk(
  'user/getUserGenerationTree',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await getUserGenerationTree(userId);
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

export const getUserDetailsWithInvestmentInfoAsync = createAsyncThunk(
  'user/getUserDetailsWithInvestmentInfo',
  async (formData: any, { signal, rejectWithValue }) => {
    try {
      const data = await getUserDetailsWithInvestmentInfo(formData, signal);
      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('An unknown error occurred');
      }
    }
  },
);

export const AddNewMemberAsync = createAsyncThunk(
  'user/AddNewMember',
  async (
    formData: {
      wallet: string;
      sponsorUsername: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await AddNewMember(formData);
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return rejectWithValue('Request canceled');
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //   getAllUserAsync
      .addCase(getAllUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
      })
      .addCase(getAllUserAsync.rejected, (state) => {
        state.isLoading = false;
      })
      //   updateUserStatusAsync
      .addCase(updateUserStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false;

        const updatedUser = action.payload.data; // Get the updated user from API
        state.users = state.users.map((user) =>
          user._id === updatedUser._id
            ? { ...user, accountStatus: updatedUser.accountStatus }
            : user,
        );
      })
      // getUserByIdAsync
      .addCase(getUserByIdAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(getUserByIdAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // updateUserProfileAsync
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u,
        );
        state.user =
          action.payload._id === state.user?._id ? action.payload : state.user;
      })
      .addCase(updateUserProfileAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // checkUsernameAsync
      .addCase(checkUsernameAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkUsernameAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(checkUsernameAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getContactMessagesAsync
      .addCase(getContactMessagesAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContactMessagesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contactMessages = action.payload.data;
      })
      .addCase(getContactMessagesAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // toggleContactMessageStatusAsync
      .addCase(changeConatctMesasgeStatusAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changeConatctMesasgeStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedContactMessage = action.payload.data;
        state.contactMessages = state.contactMessages.map((message) =>
          message._id === updatedContactMessage._id
            ? updatedContactMessage
            : message,
        );
      })
      .addCase(changeConatctMesasgeStatusAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getUserGenerationTreeAsync
      .addCase(getUserGenerationTreeAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserGenerationTreeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload;
        const encryptedUserGenerationData = response.data;

        if (!encryptedUserGenerationData) {
          console.error('Error: No encrypted data received!');
          return;
        }

        try {
          const decryptedData = CryptoJS.AES.decrypt(
            encryptedUserGenerationData,
            CRYPTO_SECRET_KEY,
          ).toString(CryptoJS.enc.Utf8);

          if (!decryptedData) {
            console.error('Error: Decryption resulted in empty data!');
            return;
          }

          const decryptedUserGenerationData = JSON.parse(decryptedData);

          state.userGenerationTree = decryptedUserGenerationData;
        } catch (error) {
          console.error('Decryption failed:', error);
        }
      })
      .addCase(getUserGenerationTreeAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getUserDetailsWithInvestmentInfoAsync
      .addCase(getUserDetailsWithInvestmentInfoAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getUserDetailsWithInvestmentInfoAsync.fulfilled,
        (state, action) => {
          state.isLoading = false;
          const encryptedUserDetails = action.payload.data;

          if (typeof encryptedUserDetails !== 'string') {
            console.error(
              'Received data is not encrypted:',
              encryptedUserDetails,
            );
            return;
          }

          try {
            const decryptedData = CryptoJS.AES.decrypt(
              encryptedUserDetails,
              CRYPTO_SECRET_KEY,
            ).toString(CryptoJS.enc.Utf8);

            if (!decryptedData || decryptedData.trim() === '') {
              console.error('Decryption failed. Empty or invalid string.');
              return;
            }

            const decryptedUserDetails = JSON.parse(decryptedData);
            state.user = decryptedUserDetails;
          } catch (error) {
            console.error('Decryption error:', error);
          }
        },
      )
      .addCase(getUserDetailsWithInvestmentInfoAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // AddNewMemberAsync
      .addCase(AddNewMemberAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(AddNewMemberAsync.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(AddNewMemberAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default userSlice.reducer;

export const selectUsers = (state: RootState) => state.users.user;
export const selectPaginationData = (state: RootState) =>
  state.users.pagination;
export const selectedUser = (state: RootState) => state.users.user;
export const selectLoading = (state: RootState) => state.users.isLoading;
