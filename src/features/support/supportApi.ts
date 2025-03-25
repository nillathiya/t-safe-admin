import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import { ApiResponse, Support, TicketMessage, Tickets } from '../../types';

export const getSupportRequests = async ({
  ticket,
  username,
  date,
  status,
  limit,
  page,
}: {
  ticket?: string;
  username?: string;
  date?: string;
  status?: number;
  limit?: number;
  page?: number;
}): Promise<ApiResponse<Support[]>> => {
  try {
    const response = await apiClient.post(
      ROUTES.SUPPORT.GET_ALL(ticket, username, date, status, limit, page),
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get company info failed. Please try again later.');
  }
};

export const updateSupportRequest = async ({
  id,
  formData,
}: {
  id: string;
  formData: any;
}): Promise<ApiResponse<Support>> => {
  try {
    const response = await apiClient.post(ROUTES.SUPPORT.UPDATE(id), formData);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update support request failed. Please try again later.');
  }
};

export const fetchTickets = async (): Promise<ApiResponse<Tickets[]>> => {
  try {
    const response = await apiClient.post(ROUTES.SUPPORT.GET_ALL_TICKETS);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get All Tickets failed. Please try again later.');
  }
};

export const fetchMessages = async ({
  ticketId,
  formData,
}: {
  ticketId: string;
  formData: any;
}): Promise<ApiResponse<Tickets>> => {
  try {
    const response = await apiClient.post(
      ROUTES.SUPPORT.GET_MESSAGES(ticketId),
      formData,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get Ticket Messages failed. Please try again later.');
  }
};

export const replyMessage = async (formData: {
  ticketId: string;
  text: string;
}): Promise<ApiResponse<Tickets>> => {
  try {
    const response = await apiClient.post(
      ROUTES.SUPPORT.REPLY_MESSAGE,
      formData,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Reply Messages failed. Please try again later.');
  }
};


export const updateTicketStatus = async ({
  ticketId,
  formData,
}: {
  ticketId: string;
  formData: any;
}): Promise<ApiResponse<Tickets>> => {
  try {
    const response = await apiClient.post(
      ROUTES.SUPPORT.UPDATE_TICKET_STATUS(ticketId),
      formData,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update ticket status failed. Please try again later.');
  }
};