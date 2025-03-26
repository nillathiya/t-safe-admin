import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';

export const adminLogin = async (formData: any): Promise<any> => {
  try {
    const response = await apiClient.post(ROUTES.AUTH.ADMIN_LOGIN, formData);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Sign-up failed. Please try again later.');
  }
};

export const adminLogout = async (): Promise<void> => {
  console.log('logout called');
  try {
    const response = await apiClient.post(ROUTES.AUTH.LOGOUT);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Logout failed. Please try again later.');
  }
};

export const adminChangePassword = async (formData: any): Promise<any> => {
  try {
    const response = await apiClient.post(
      ROUTES.AUTH.CHANGE_PASSWORD,
      formData,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Change password failed. Please try again later.');
  }
};

export const requestImpersonationToken = async (
  userId: string,
): Promise<any> => {
  try {
    const response = await apiClient.post(ROUTES.AUTH.IMPERSONATE, { userId });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get token failed. Please try again later.');
  }
};
