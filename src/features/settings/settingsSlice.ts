import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getRankSettings,
  createRankSetting,
  updateRankSetting,
  deleteRankSetting,
  deleteRow,
  saveRow,
  getAllCompanyInfo,
  updateCompanyInfo,
  getUserSettings,
  getAdminSettings,
  updateUserSetting,
  updateAdminSetting,
  getAdminSettingsByQuery,
  getAllComapnyInfoForAdmin,
  deleteCompanyInfo,
} from './settingsApi';
import { IAdminSettingParams, ICompanyInfo } from '../../types/settings';

interface SettingsState {
  isLoading: boolean;
  updateSettingsIsLoading: boolean;
  deleteSettingsIsLoading: boolean;
  addSettingsIsLoading: boolean;
  deleteRowIsLoading: boolean;
  saveRowIsLoading: boolean;
  companyInfoLoading: boolean;
  rankSettings: any[];
  userSettings: any[];
  adminSettings: any[];
  companyInfo: ICompanyInfo[];
  adminCompanyInfo: ICompanyInfo[];
}

export interface RootState {
  settings: SettingsState;
}

const initialState: SettingsState = {
  isLoading: false,
  updateSettingsIsLoading: false,
  deleteSettingsIsLoading: false,
  addSettingsIsLoading: false,
  deleteRowIsLoading: false,
  saveRowIsLoading: false,
  companyInfoLoading: false,
  rankSettings: [],
  userSettings: [],
  adminSettings: [],
  companyInfo: [],
  adminCompanyInfo: [],
};

export const getRankSettingsAsync = createAsyncThunk(
  'settings/getRankSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getRankSettings();
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

export const createRankSettingAsync = createAsyncThunk(
  'settings/createRankSetting',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await createRankSetting(formData);
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

export const updateRankSettingAsync = createAsyncThunk(
  'settings/updateRankSetting',
  async (
    { id, formData }: { id: string; formData: any },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateRankSetting(id, formData);
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

export const deleteRankSettingAsync = createAsyncThunk(
  'settings/deleteRankSetting',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await deleteRankSetting(id);
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

export const deleteRowAsync = createAsyncThunk(
  'settings/deleteRow',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await deleteRow(formData);
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

export const saveRowAsync = createAsyncThunk(
  'settings/saveRow',
  async (formData: any, { rejectWithValue }) => {
    try {
      const data = await saveRow(formData);
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

export const getAllCompanyInfoAsync = createAsyncThunk(
  'settings/getAllCompanyInfo',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllCompanyInfo();
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

export const updateCompanyInfoAsync = createAsyncThunk(
  'settings/updateCompanyInfo',
  async (
    params: {
      id: string;
      formData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateCompanyInfo(params);
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

export const getUserSettingsAsync = createAsyncThunk(
  'settings/getUserSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserSettings();
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

export const getAdminSettingsAsync = createAsyncThunk(
  'settings/getAdminSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminSettings();
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

export const updateUserSettingAsync = createAsyncThunk(
  'settings/updateUserSetting',
  async (
    params: {
      id: string;
      formData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateUserSetting(params);
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

export const updateAdminSettingAsync = createAsyncThunk(
  'settings/updateAdminSetting',
  async (
    params: {
      id: string;
      formData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateAdminSetting(params);
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

export const getAdminSettingsByQueryAsync = createAsyncThunk(
  'settings/getAdminSettingsByQuery',
  async (params: IAdminSettingParams, { rejectWithValue }) => {
    try {
      const data = await getAdminSettingsByQuery(params);
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

export const getAllComapnyInfoForAdminAsync = createAsyncThunk(
  'settings/getAllComapnyInfoForAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllComapnyInfoForAdmin();
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
export const deleteCompanyInfoAsync = createAsyncThunk(
  'settings/deleteCompanyInfo',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await deleteCompanyInfo(id);
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

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //   getRankSettingsAsync
      .addCase(getRankSettingsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRankSettingsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rankSettings = action.payload.data;
      })
      .addCase(getRankSettingsAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // addRankSettingAsync
      .addCase(createRankSettingAsync.pending, (state) => {
        state.addSettingsIsLoading = true;
      })
      .addCase(createRankSettingAsync.fulfilled, (state, action) => {
        state.addSettingsIsLoading = false;
        state.rankSettings.push(action.payload.data);
      })
      .addCase(createRankSettingAsync.rejected, (state) => {
        state.addSettingsIsLoading = false;
      })
      // updateRankSettingAsync
      .addCase(updateRankSettingAsync.pending, (state) => {
        state.updateSettingsIsLoading = true;
      })
      .addCase(updateRankSettingAsync.fulfilled, (state, action) => {
        state.updateSettingsIsLoading = false;
        const index = state.rankSettings.findIndex(
          (item) => item._id === action.payload.data._id,
        );
        if (index !== -1) state.rankSettings[index] = action.payload.data;
      })
      .addCase(updateRankSettingAsync.rejected, (state) => {
        state.updateSettingsIsLoading = false;
      })
      // deleteRankSettingAsync
      .addCase(deleteRankSettingAsync.pending, (state) => {
        state.deleteSettingsIsLoading = true;
      })
      .addCase(deleteRankSettingAsync.fulfilled, (state, action) => {
        state.deleteSettingsIsLoading = false;
        state.rankSettings = state.rankSettings.filter(
          (item) => item._id !== action.payload.data._id,
        );
      })
      .addCase(deleteRankSettingAsync.rejected, (state) => {
        state.deleteSettingsIsLoading = false;
      })
      // deleteRowAsync
      .addCase(deleteRowAsync.pending, (state) => {
        state.deleteRowIsLoading = true;
      })
      .addCase(deleteRowAsync.fulfilled, (state, action) => {
        state.deleteRowIsLoading = false;

        // Ensure action.payload.data is an array before assigning
        if (Array.isArray(action.payload?.data)) {
          state.rankSettings = action.payload.data;
        }
      })
      .addCase(deleteRowAsync.rejected, (state) => {
        state.deleteRowIsLoading = false;
      })
      // saveRowAsync
      .addCase(saveRowAsync.pending, (state) => {
        state.saveRowIsLoading = true;
      })
      .addCase(saveRowAsync.fulfilled, (state, action) => {
        state.saveRowIsLoading = false;

        // Ensure action.payload exists and data is an array before updating state
        if (Array.isArray(action.payload?.data)) {
          state.rankSettings = action.payload.data;
        } else {
          console.warn('Unexpected response format:', action.payload);
        }
      })
      .addCase(saveRowAsync.rejected, (state, action) => {
        state.saveRowIsLoading = false;
        console.error('Error saving row:', action.error?.message);
      })
      // getAllCompanyInfoAsync
      .addCase(getAllCompanyInfoAsync.pending, (state) => {
        state.companyInfoLoading = true;
      })
      .addCase(getAllCompanyInfoAsync.fulfilled, (state, action) => {
        state.companyInfoLoading = false;
        state.companyInfo = action.payload.data;
      })
      .addCase(getAllCompanyInfoAsync.rejected, (state) => {
        state.companyInfoLoading = false;
      })
      // updateCompanyInfoAsync
      .addCase(updateCompanyInfoAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedSetting = action.payload?.data;

        if (updatedSetting?._id) {
          const index = state.companyInfo.findIndex(
            (item) => item._id === updatedSetting._id,
          );

          if (index !== -1) {
            // Update the existing item
            state.companyInfo[index] = {
              ...state.companyInfo[index],
              ...updatedSetting,
            };
          } else {
            // If not found, add it (though this shouldn't happen on update)
            state.companyInfo.push(updatedSetting);
          }

          // ✅ Fix: use `.map()` instead of treating it like a function
          state.adminCompanyInfo = state.adminCompanyInfo.map((setting) =>
            setting._id === updatedSetting._id ? updatedSetting : setting,
          );
        }
      })
      .addCase(updateCompanyInfoAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getUserSettingsAsync
      .addCase(getUserSettingsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserSettingsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSettings = action.payload.data;
      })
      .addCase(getUserSettingsAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // updateUserSettingAsync
      .addCase(updateUserSettingAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserSettingAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedSetting = action.payload?.data;
        if (updatedSetting?._id) {
          const index = state.userSettings.findIndex(
            (item) => item._id === updatedSetting._id,
          );
          if (index !== -1) {
            // Update the existing item
            state.userSettings[index] = {
              ...state.userSettings[index],
              ...updatedSetting,
            };
          } else {
            state.userSettings.push(updatedSetting);
          }
        }
      })
      .addCase(updateUserSettingAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getAdminSettingsAsync
      .addCase(getAdminSettingsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAdminSettingsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminSettings = action.payload.data;
      })
      .addCase(getAdminSettingsAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // updateAdminSettingAsync
      .addCase(updateAdminSettingAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAdminSettingAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedSetting = action.payload?.data;
        if (updatedSetting?._id) {
          const index = state.adminSettings.findIndex(
            (item) => item._id === updatedSetting._id,
          );
          if (index !== -1) {
            // Update the existing item
            state.adminSettings[index] = {
              ...state.adminSettings[index],
              ...updatedSetting,
            };
          } else {
            state.adminSettings.push(updatedSetting);
          }
        }
      })
      .addCase(updateAdminSettingAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // getAllComapnyInfoForAdminAsync
      .addCase(getAllComapnyInfoForAdminAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllComapnyInfoForAdminAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminCompanyInfo = action.payload.data;
      })
      .addCase(getAllComapnyInfoForAdminAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default settingsSlice.reducer;
