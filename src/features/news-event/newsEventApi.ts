import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import { ApiResponse, NewsEvent } from '../../types';

export const createNewsEvent = async (
  formData: FormData,
): Promise<ApiResponse<NewsEvent>> => {
  try {
    const response = await apiClient.post(ROUTES.NEWS_EVENT.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Add New and Event failed. Please try again later.');
  }
};

export const getAllNewsEvents = async (): Promise<ApiResponse<NewsEvent[]>> => {
  try {
    const response = await apiClient.get(ROUTES.NEWS_EVENT.GET_ALL);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get All  New and Event failed. Please try again later.');
  }
};

export const updateNewsEvent = async (id:string,
  formData: FormData,
): Promise<ApiResponse<NewsEvent>> => {
  try {
    const response = await apiClient.put(ROUTES.NEWS_EVENT.UPDATE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update New and Event failed. Please try again later.');
  }
};
