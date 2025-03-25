import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createNewsEvent,
  getAllNewsEvents,
  updateNewsEvent,
} from './newsEventApi';
import { NewsEvent } from '../../types';

interface NewsEventState {
  isLoading: boolean;
  newsEvents: NewsEvent[];
  newsEvent: NewsEvent | null;
}

export interface RootState {
  newsEvent: NewsEventState;
}

const initialState: NewsEventState = {
  isLoading: false,
  newsEvents: [],
  newsEvent: null,
};

export const getAllNewsEventsAsync = createAsyncThunk(
  'newsEvent/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllNewsEvents();
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

export const createNewsEventAsync = createAsyncThunk(
  'newsEvent/createNewsEvent',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const data = await createNewsEvent(formData);
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

export const updateNewsEventAsync = createAsyncThunk(
  'newsEvent/updateNewsEvent',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const data = await updateNewsEvent(formData);
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

const newsEventSlice = createSlice({
  name: 'newsEvent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllNewsEventsAsync
      .addCase(getAllNewsEventsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllNewsEventsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.newsEvents = action.payload?.data || [];
      })
      .addCase(getAllNewsEventsAsync.rejected, (state) => {
        state.isLoading = false;
      })
      //   createNewsEventAsync
      .addCase(createNewsEventAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewsEventAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.newsEvents = [...state.newsEvents, action.payload.data];
      })
      .addCase(createNewsEventAsync.rejected, (state) => {
        state.isLoading = false;
      })

      // updateNewsEventAsync
      .addCase(updateNewsEventAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateNewsEventAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedNewEvent = action.payload.data;

        state.newsEvents = state.newsEvents.map((newsEvent) =>
          newsEvent._id === updatedNewEvent._id ? updatedNewEvent : newsEvent,
        );
      })
      .addCase(updateNewsEventAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default newsEventSlice.reducer;
