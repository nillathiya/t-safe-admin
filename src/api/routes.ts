import { IFundTransactionParams, ITicketMsgQuery } from '../types';
import { IAdminSettingParams } from '../types/settings';

// Define the API_URL using environment variables
export const API_URL: string = import.meta.env.VITE_API_URL;

// Define the ROUTES object with proper typing
interface Routes {
  AUTH: {
    ADMIN_LOGIN: string;
    REGISTER: string;
    LOGOUT: string;
    CHANGE_PASSWORD: string;
    IMPERSONATE: string;
  };
  SUPPORT: {
    GET_ALL: (
      ticket?: string,
      username?: string,
      date?: string,
      status?: number,
      limit?: number,
      page?: number,
    ) => string;
    UPDATE: (id: string) => string;
    GET_ALL_TICKETS: string;
    GET_MESSAGES: (ticketId: string,query:ITicketMsgQuery) => string;
    REPLY_MESSAGE: string;
    UPDATE_TICKET_STATUS: (ticketId: string) => string;
  };
  WITHDRAWAL: {
    GET_ALL: string;
    UPDATE_REQUEST: (id: string) => string;
  };
  USER: {
    GET_BY_ID: (userId: string) => string;
    GET_ALL: string;
    UPDATE_USER: any;
    UPDATE_PROFILE: string;
    CHECK_NAME: string;
    GET_GENERATION_TREE: string;
    GET_DETAILS_WITH_INVEST_INFO: string;
    ADD_MEMBER: string;
  };
  ORDER: {
    GET_ALL: string;
    GET_BY_ID: (orderId: string) => string;
  };
  TRANSACTION: {
    GET_ALL: string;
    FUND: {
      GET_ALL: (params: IFundTransactionParams) => string;
      DIRECT_TRANSFER: string;
      UPDATE_USER_TRANSACTION: (id: string) => string;
    };
    INCOME: {
      GET_ALL: string;
    };
  };
  SETTINGS: {
    GET_RANK_SETTINGS: string;
    GET_USER_SETTINGS: string;
    GET_ADMIN_SETTINGS: string;
    GET_COMPANY_INFO_SETTINGS: string;
    DELETE_COMPANY_INFO_SETTING: (id: string) => string;
    UPDATE_USER_SETTING: (id: string) => string;
    UPDATE_ADMIN_SETTING: (id: string) => string;
    UPDATE_COMPANY_INFO_SETTING: (id: string) => string;
    GET_ADMIN_BY_QUERY: (params: IAdminSettingParams) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    DELETE_ROW: string;
    SAVE_ROW: string;
  };
  NEWS_EVENT: {
    CREATE: string;
    GET_ALL: string;
    UPDATE: (id: string) => string;
  };
  CONTACT_US: {
    GET_MESSAGES: string;
    TOGGLE_STATUS: string;
  };
}

// Define and export the ROUTES object
export const ROUTES: Routes = {
  AUTH: {
    ADMIN_LOGIN: `${API_URL}/auth/admin/login`,
    REGISTER: `${API_URL}/api/user/add`,
    LOGOUT: `${API_URL}/auth/logout`,
    CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
    IMPERSONATE: `${API_URL}/auth/admin/impersonate`,
  },
  SUPPORT: {
    GET_ALL: (
      ticket?: string,
      username?: string,
      date?: string,
      status?: number,
      limit?: number,
      page?: number,
    ) => {
      const query = new URLSearchParams();

      if (ticket !== undefined && ticket !== null)
        query.append('ticket', ticket.toString());
      if (username !== undefined && username !== null)
        query.append('username', username.toString());
      if (date !== undefined && date !== null)
        query.append('date', date.toString());
      if (status !== undefined && status !== null)
        query.append('status', status.toString());
      if (limit !== undefined && limit !== null)
        query.append('limit', limit.toString());
      if (page !== undefined && page !== null)
        query.append('page', page.toString());

      return `${API_URL}/api/support/get-requests?${query.toString()}`;
    },
    UPDATE: (id: string) => `${API_URL}/api/support/update-request/${id}`,
    GET_ALL_TICKETS: `${API_URL}/api/tickets/all`,
    GET_MESSAGES: (ticketId: string, params: ITicketMsgQuery) => {
      const query = new URLSearchParams();
    
      Object.keys(params).forEach((param) => {
        const value = params[param as keyof typeof params];
        if (value !== undefined && value !== null) {
          query.append(param, String(value));
        }
      });
    
      return `${API_URL}/api/tickets/${ticketId}/messages?${query.toString()}`;
    },
    REPLY_MESSAGE: `${API_URL}/api/tickets/message/reply`,
    UPDATE_TICKET_STATUS: (ticketId) =>
      `${API_URL}/api/tickets/status/${ticketId}`,
  },
  WITHDRAWAL: {
    GET_ALL: `${API_URL}/fund/withdrawals`,
    UPDATE_REQUEST: (id: string) => `${API_URL}/fund/withdrawal/user/${id}`,
  },
  USER: {
    GET_BY_ID: (userId: string) => `${API_URL}/user/${userId}`,
    GET_ALL: `${API_URL}/user`,
    UPDATE_USER: `${API_URL}/user/edit-profile`,
    UPDATE_PROFILE: `${API_URL}/user/edit-profile`,
    CHECK_NAME: `${API_URL}/user/check-name`,
    GET_GENERATION_TREE: `${API_URL}/api/user/generation-tree`,
    GET_DETAILS_WITH_INVEST_INFO: `${API_URL}/api/user/details-with-investment`,
    ADD_MEMBER: `${API_URL}/api/user/create`,
  },
  ORDER: {
    GET_ALL: `${API_URL}/user/orders`,
    GET_BY_ID: (orderId: string) => `${API_URL}/api/orders/get/${orderId}`,
  },
  TRANSACTION: {
    GET_ALL: `${API_URL}/fund/transactions`,
    FUND: {
      GET_ALL: (params: IFundTransactionParams) => {
        const query = new URLSearchParams();
        // Iterate through the parameters and append to query if valid
        Object.keys(params).forEach((param) => {
          const value = params[param];
          if (value !== undefined && value !== null) {
            query.append(param, String(value)); // Ensuring the value is a string
          }
        });

        return `${API_URL}/fund/transactions?${query.toString()}`;
      },
      DIRECT_TRANSFER: `${API_URL}/fund/transfer/admin`,
      UPDATE_USER_TRANSACTION: (id: string) =>
        `${API_URL}/fund/transactions/${id}/user`,
    },
    INCOME: {
      GET_ALL: `${API_URL}/fund/income`,
    },
  },
  SETTINGS: {
    // User
    GET_USER_SETTINGS: `${API_URL}/user-setting`,
    UPDATE_USER_SETTING: (id: string) => `${API_URL}/user-setting/${id}`,

    // Admin
    GET_ADMIN_SETTINGS: `${API_URL}/admin-setting`,
    UPDATE_ADMIN_SETTING: (id: string) => `${API_URL}/admin-setting/${id}`,
    GET_ADMIN_BY_QUERY: (params: IAdminSettingParams) => {
      const query = new URLSearchParams();

      // Iterate through the parameters and append to query if valid
      Object.keys(params).forEach((param) => {
        const value = params[param];
        if (value !== undefined && value !== null) {
          query.append(param, String(value)); // Ensuring the value is a string
        }
      });

      return `${API_URL}/admin-setting?${query.toString()}`;
    },

    // CompanyInfo
    GET_COMPANY_INFO_SETTINGS: `${API_URL}/api/company-info`,
    UPDATE_COMPANY_INFO_SETTING: (id: string) =>
      `${API_URL}/api/company-info/${id}`,
    DELETE_COMPANY_INFO_SETTING: (id: string) =>
      `${API_URL}/api/company-info/${id}`,

    // rank
    GET_RANK_SETTINGS: `${API_URL}/api/rank-setting`,
    CREATE: `${API_URL}/api/rank-setting`,
    UPDATE: (id: string) => `${API_URL}/api/rank-setting/${id}`,
    DELETE: (id: string) => `${API_URL}/api/rank-setting/${id}`,
    DELETE_ROW: `${API_URL}/api/rank-setting/delete-row`,
    SAVE_ROW: `${API_URL}/api/rank-setting/save-row`,
  },
  NEWS_EVENT: {
    CREATE: `${API_URL}/api/news-events`,
    GET_ALL: `${API_URL}/api/news-events`,
    UPDATE: (id: string) => `${API_URL}/api/news-events/${id}`,
  },
  CONTACT_US: {
    GET_MESSAGES: `${API_URL}/api/contact-us/list`,
    TOGGLE_STATUS: `${API_URL}/api/contact-us/change-status`,
  },
};
