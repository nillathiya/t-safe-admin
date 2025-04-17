import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import {
  ApiResponse,
  IFundTransaction,
  IFundTransactionParams,
  IncomeTransaction,
  IUpdateUserFundTransactionPayload,
} from '../../types';

export const getAllIncomeTransaction = async (
  formData: any,
): Promise<ApiResponse<IncomeTransaction[]>> => {
  try {
    const response = await apiClient.get(
      ROUTES.TRANSACTION.INCOME.GET_ALL,
      formData,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error(
      'Get All Income transaction failed. Please try again later.',
    );
  }
};

export const directTransferFund = async (
  formData: any,
): Promise<ApiResponse<IFundTransaction>> => {
  try {
    const response = await apiClient.post(
      ROUTES.TRANSACTION.FUND.DIRECT_TRANSFER,
      formData,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Direct Transfer fund  failed. Please try again later.');
  }
};

export const getFundTransactions = async (
  params: IFundTransactionParams,
): Promise<ApiResponse<IFundTransaction[]>> => {
  try {
    const response = await apiClient.get(
      ROUTES.TRANSACTION.FUND.GET_ALL(params),
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error(
      'Get Admin fund transaction failed. Please try again later.',
    );
  }
};

export const updateUserFundTransaction = async (
  id: string,
  formData: IUpdateUserFundTransactionPayload,
): Promise<ApiResponse<IFundTransaction>> => {
  try {
    const response = await apiClient.put(
      ROUTES.TRANSACTION.FUND.UPDATE_USER_TRANSACTION(id),
      formData,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error(
      'Get Admin fund transaction failed. Please try again later.',
    );
  }
};
