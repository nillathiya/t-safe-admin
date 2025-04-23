import { apiClient } from '../../api/apiClient';
import { ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';
import { ApiResponse } from '../../types';
import {
  IAdminSettingParams,
  ICompanyInfo,
  RankSettings,
} from '../../types/settings';

// Add a new rank setting (column)
export const createRankSetting = async (
  formData: any,
): Promise<ApiResponse<RankSettings>> => {
  try {
    const response = await apiClient.post(ROUTES.SETTINGS.CREATE, formData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Add Rank settings failed. Please try again later.');
  }
};

export const getRankSettings = async (): Promise<
  ApiResponse<RankSettings[]>
> => {
  try {
    const response = await apiClient.get(ROUTES.SETTINGS.GET_RANK_SETTINGS);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get Rank settings failed. Please try again later.');
  }
};

// Update a rank setting (column title or values)
export const updateRankSetting = async (
  id: string,
  formData: any,
): Promise<ApiResponse<RankSettings>> => {
  try {
    const response = await apiClient.put(ROUTES.SETTINGS.UPDATE(id), formData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update Rank settings failed. Please try again later.');
  }
};

// Delete a rank setting (column)
export const deleteRankSetting = async (
  id: string,
): Promise<ApiResponse<RankSettings>> => {
  try {
    const response = await apiClient.delete(ROUTES.SETTINGS.DELETE(id));
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Delete Rank settings failed. Please try again later.');
  }
};

export const deleteRow = async (
  formData: any,
): Promise<ApiResponse<RankSettings[]>> => {
  try {
    const response = await apiClient.post(ROUTES.SETTINGS.DELETE_ROW, formData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Delete Rank settings row failed. Please try again later.');
  }
};

export const saveRow = async (
  formData: any,
): Promise<ApiResponse<RankSettings>> => {
  try {
    const response = await apiClient.post(ROUTES.SETTINGS.SAVE_ROW, formData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Save Rank settings row failed. Please try again later.');
  }
};
export const getAllCompanyInfo = async (): Promise<
  ApiResponse<ICompanyInfo[]>
> => {
  try {
    const response = await apiClient.get(
      ROUTES.SETTINGS.GET_COMPANY_INFO_SETTINGS,
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get Company info failed. Please try again later.');
  }
};

export const updateCompanyInfo = async ({
  id,
  formData,
}: {
  id: string;
  formData: any;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.put(
      ROUTES.SETTINGS.UPDATE_COMPANY_INFO_SETTING(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update company info failed. Please try again later.');
  }
};

export const deleteCompanyInfo = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.put(
      ROUTES.SETTINGS.DELETE_COMPANY_INFO_SETTING(id),
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Delete company info failed. Please try again later.');
  }
};

export const getUserSettings = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get(ROUTES.SETTINGS.GET_USER_SETTINGS);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get user settings failed. Please try again later.');
  }
};

export const getAdminSettings = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get(ROUTES.SETTINGS.GET_ADMIN_SETTINGS);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get admin settings failed. Please try again later.');
  }
};

export const updateUserSetting = async ({
  id,
  formData,
}: {
  id: string;
  formData: any;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.put(
      ROUTES.SETTINGS.UPDATE_USER_SETTING(id),
      formData,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update user setting failed. Please try again later.');
  }
};

export const updateAdminSetting = async ({
  id,
  formData,
}: {
  id: string;
  formData: any;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.put(
      ROUTES.SETTINGS.UPDATE_ADMIN_SETTING(id),
      formData,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update Admin setting failed. Please try again later.');
  }
};

export const getAdminSettingsByQuery = async (
  params: IAdminSettingParams,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get(
      ROUTES.SETTINGS.GET_ADMIN_BY_QUERY(params),
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Update Admin setting failed. Please try again later.');
  }
};

export const getAllComapnyInfoForAdmin = async (): Promise<
  ApiResponse<ICompanyInfo[]>
> => {
  try {
    const response = await apiClient.get(
      ROUTES.SETTINGS.GET_COMPANY_INFO_SETTINGS,
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'An error occurred.');
    }
    throw new Error('Get Company setting failed. Please try again later.');
  }
};
