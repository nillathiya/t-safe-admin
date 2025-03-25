import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import { ApiResponse, IContactUs } from '../../types';

export const getAllUser = async (): Promise<any> => {
  try {
    const response = await apiClient.get(ROUTES.USER.GET_ALL);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get All users failed. Please try again later.');
  }
};

export const getAllUserUpdate = async (payload: {
  userId: string;
  accountStatus: {
    activeStatus?: number;
    blockStatus?: number;
  };
}): Promise<any> => {
  try {
    const response = await apiClient.post(ROUTES.USER.UPDATE_USER, payload);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update user status failed. Please try again later.');
  }
};

export const getUserById = async (userId: string): Promise<any> => {
  try {
    const response = await apiClient.get(ROUTES.USER.GET_BY_ID(userId));
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get User info failed. Please try again later.');
  }
};

export const updateUserProfile = async (formData: any): Promise<any> => {
  try {
    const response = await apiClient.post(ROUTES.USER.UPDATE_PROFILE, formData);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update User Profile failed. Please try again later.');
  }
};

export const checkUsername = async (formData: any): Promise<any> => {
  try {
    const response = await apiClient.post(ROUTES.USER.CHECK_NAME, formData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('User Check Name failed. Please try again later.');
  }
};

export const getContactMessages = async (): Promise<
  ApiResponse<IContactUs[]>
> => {
  try {
    const response = await apiClient.post(ROUTES.CONTACT_US.GET_MESSAGES);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get Conatct Messages failed. Please try again later.');
  }
};

export const changeConatctMesasgeStatus = async (formData: {
  id: string;
  status: string;
}): Promise<ApiResponse<IContactUs>> => {
  try {
    const response = await apiClient.post(
      ROUTES.CONTACT_US.TOGGLE_STATUS,
      formData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error(
      'Toggle Conatct Messages status failed. Please try again later.',
    );
  }
};

export const getUserGenerationTree = async (userId: string): Promise<any> => {
  try {
    const response = await apiClient.post(ROUTES.USER.GET_GENERATION_TREE, {
      userId,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get user generation tree failed. Please try again later.');
  }
};

export const getUserDetailsWithInvestmentInfo = async (
  formData: any,
  signal: any,
) => {
  try {
    const response = await apiClient.post(
      ROUTES.USER.GET_DETAILS_WITH_INVEST_INFO,
      formData,
      { signal },
    );
    return response.data;
  } catch (error: any) {
    if (error.name === 'CanceledError') {
      console.log('Request canceled:', error.message);
      return;
    }

    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }

    throw new Error(
      'Get user details with investment info failed. Please try again later.',
    );
  }
};

export const AddNewMember = async (formData: {
  wallet: string;
  sponsorUsername: string;
}) => {
  try {
    const response = await apiClient.post(ROUTES.USER.ADD_MEMBER, formData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }

    throw new Error('Add New Member failed. Please try again later.');
  }
};
