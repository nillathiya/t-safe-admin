import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getSupportRequests,
  updateSupportRequest,
  fetchTickets,
  fetchMessages,
  replyMessage,
  updateTicketStatus,
} from './supportApi';
import { Pagination, Support, TicketMessage, Tickets } from '../../types';

interface SupportState {
  isLoading: boolean;
  requestedSupports: Support[];
  tickets: Tickets[];
  isTicketsLoading: boolean;
  messages: TicketMessage[];
  isTicketMessageLoading: boolean;
  pagination: Pagination | null;
}

export interface RootState {
  support: SupportState;
}

const initialState: SupportState = {
  isLoading: false,
  tickets: [],
  isTicketsLoading: false,
  messages: [],
  isTicketMessageLoading: false,
  requestedSupports: [],
  pagination: null,
};

export const getSupportRequestsAsync = createAsyncThunk(
  'support/getSupportRequests',
  async (
    params: {
      ticket?: string;
      username?: string;
      date?: string;
      status?: number;
      limit?: number;
      page?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await getSupportRequests(params);
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

export const updateSupportRequestAsync = createAsyncThunk(
  'transaction/updateSupportRequest',
  async (
    params: {
      id: string;
      formData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateSupportRequest(params);
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

export const fetchTicketsAsync = createAsyncThunk(
  'support/updateSupportRequest',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchTickets();
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

export const fetchMessagesAsync = createAsyncThunk(
  'support/fetchMessages',
  async (
    params: {
      ticketId: string;
      formData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await fetchMessages(params);
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

export const replyMessageAsync = createAsyncThunk(
  'support/replyMessage',
  async (formData: { ticketId: string; text: string }, { rejectWithValue }) => {
    try {
      const data = await replyMessage(formData);
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

export const updateTicketStatusAsync = createAsyncThunk(
  'support/updateTicketStatus',
  async (
    params: {
      ticketId: string;
      formData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateTicketStatus(params);
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

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    increaseUnreadCount: (state, action) => {
      const ticket = state.tickets.find(
        (t) => t._id === action.payload.ticketId,
      );
      if (ticket) {
        ticket.unreadMessages = ticket.unreadMessages || {};
        ticket.unreadMessages.admin = (ticket.unreadMessages.admin || 0) + 1;
      }
    },
    resetUnreadMessages: (state, action) => {
      const ticket = state.tickets.find(
        (t) => t._id === action.payload.ticketId,
      );
      if (ticket) {
        ticket.unreadMessages = { admin: 0, user: 0 };
      }
    },
    resetAdminUnreadMessages: (state, action) => {
      const ticket = state.tickets.find(
        (t) => t._id === action.payload.ticketId,
      );
      if (ticket) {
        ticket.unreadMessages.admin = 0;
      }
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    markAllMessagesAsRead: (state) => {
      state.messages = state.messages.map((msg) => ({
        ...msg,
        isRead: true,
      }));
    },
    addTicket: (state, action) => {
      state.tickets.push(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder

      // getSupportRequestsAsync
      .addCase(getSupportRequestsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSupportRequestsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requestedSupports = action.payload.data;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(getSupportRequestsAsync.rejected, (state) => {
        state.isLoading = false;
      })

      // updateCompanyInfoAsync
      .addCase(updateSupportRequestAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSupportRequestAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateSupportRequestAsync.rejected, (state) => {
        state.isLoading = false;
      })

      // fetchTicketsAsync
      .addCase(fetchTicketsAsync.pending, (state) => {
        state.isTicketsLoading = true;
      })
      .addCase(fetchTicketsAsync.fulfilled, (state, action) => {
        state.isTicketsLoading = false;
        state.tickets = action.payload.data;
      })
      .addCase(fetchTicketsAsync.rejected, (state) => {
        state.isTicketsLoading = false;
      })

      // fetchMessagesAsync
      .addCase(fetchMessagesAsync.pending, (state) => {
        state.isTicketMessageLoading = true;
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.isTicketMessageLoading = false;
        state.messages = action.payload.data.messages || [];

        const ticketId = action.payload?.data?._id;
        if (!ticketId) return;

        state.tickets = state.tickets.map((t) =>
          t._id === ticketId
            ? { ...t, unreadMessages: { ...t.unreadMessages, admin: 0 } }
            : t,
        );
      })

      .addCase(fetchMessagesAsync.rejected, (state) => {
        state.isTicketMessageLoading = false;
      })

      // replyMessageAsync
      .addCase(replyMessageAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(replyMessageAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(replyMessageAsync.rejected, (state) => {
        state.isLoading = false;
      })

      // updateTicketStatusAsync
      .addCase(updateTicketStatusAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTicketStatusAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateTicketStatusAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

// Export the reducer and actions
export default supportSlice.reducer;
export const {
  increaseUnreadCount,
  resetUnreadMessages,
  resetAdminUnreadMessages,
  addMessage,
  markAllMessagesAsRead,
  addTicket,
} = supportSlice.actions;
export const selectLoading = (state: RootState) => state.support.isLoading;
export const selectTicketsLoading = (state: RootState) =>
  state.support.isTicketsLoading;
export const selectTicketMessageLoading = (state: RootState) =>
  state.support.isTicketMessageLoading;
export const selectTicketMessages = (state: RootState) =>
  state.support.messages;
export const selectRequestedSupports = (state: RootState) =>
  state.support.requestedSupports;
export const selectSupportPaginationData = (state: RootState) =>
  state.support.pagination;

export const selectAllTickets = (state: RootState) => state.support.tickets;
