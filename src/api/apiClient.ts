import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Store } from '@reduxjs/toolkit';

// Create an Axios instance with proper type annotations
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAdminToken = (userId: string) => {
  console.log('userId', userId);
  return localStorage.getItem(`adminToken_${userId}`);
};

export const setupApiInterceptors = (store: Store) => {
  // Request Interceptor: Attach user token
  apiClient.interceptors.request.use(
    (config) => {
      const { auth } = store.getState();
      const loggedInUser = auth.currentUser;
      console.log('loggedInUser', loggedInUser);

      if (loggedInUser && loggedInUser._id) {
        const adminToken = getAdminToken(loggedInUser._id);
        console.log('adminToken', adminToken);
        if (adminToken) {
          console.log('adminToken');
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    },
  );

  // Response Interceptor: Handle 401 errors
  let isLoggingOut = false;
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !isLoggingOut) {
        // alert('Your session has expired. Please log in again.');
        isLoggingOut = true;
        try {
          console.warn('Session expired, logging out user...');
          const dispatch = store.dispatch;
          const { clearUser } = await import('../features/auth/authSlice');

          await dispatch(clearUser());

          // Clear token from localStorage
          const { auth } = store.getState();
          const loggedInUser = auth.currentUser;
          if (loggedInUser?._id) {
            localStorage.removeItem(`adminToken_${loggedInUser._id}`);
          }

          window.location.href = '/';
        } catch (err) {
          console.error('Error during 401 handling:', err);
          window.location.href = '/';
        } finally {
          isLoggingOut = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

// Export a function to initialize interceptors manually if needed
export const initializeInterceptors = async () => {
  try {
    const { store } = await import('../store/store');
    setupApiInterceptors(store);
  } catch (error) {
    console.error('Failed to initialize Axios interceptors:', error);
  }
};
