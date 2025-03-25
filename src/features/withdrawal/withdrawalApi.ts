import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';

export const getAllWithdrawal = async (): Promise<any> => {
  try {
    const response = await apiClient.get(ROUTES.WITHDRAWAL.GET_ALL);
    const data = response.data;
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get All Withdrawal failed. Please try again later.');
  }
};

export const updateWithdrawalRequest = async (
  id: string,
  formData: { status: number; response: string },
): Promise<any> => {
  try {
    const response = await apiClient.put(
      ROUTES.WITHDRAWAL.UPDATE_REQUEST(id),
      formData,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error(
      'Update Withdrawal Request failed. Please try again later.',
    );
  }
};
