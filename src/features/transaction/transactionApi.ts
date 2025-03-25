import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import { ApiResponse, FundTransaction, IncomeTransaction } from '../../types';

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
): Promise<ApiResponse<FundTransaction>> => {
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

export const getAdminFundTransaction = async ({
  txType,
}: {
  txType: string;
}): Promise<ApiResponse<FundTransaction[]>> => {
  try {
    const response = await apiClient.get(
      ROUTES.TRANSACTION.FUND.GET_ALL(txType));
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
