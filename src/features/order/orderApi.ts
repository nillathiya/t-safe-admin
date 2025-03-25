import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import { Order, ApiResponse } from '../../types';

export const getAllOrders = async (): Promise<ApiResponse<Order[]>> => {
  try {
    const response = await apiClient.get(ROUTES.ORDER.GET_ALL);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get all Order failed. Please try again later.');
  }
};

export const getOrderById = async (
  orderId: string,
): Promise<ApiResponse<Order>> => {
  try {
    const response = await apiClient.get(ROUTES.ORDER.GET_BY_ID(orderId));
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get Order By Id failed. Please try again later.');
  }
};
