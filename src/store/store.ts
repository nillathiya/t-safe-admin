import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import withdrawalReducer from '../features/withdrawal/withdrawalSlice';
import userReducer from '../features/user/userSlice';
import ordersReducer from '../features/order/orderSlice';
import transactionReducer from '../features/transaction/transactionSlice';
import supportReducer from '../features/support/supportSlice';
import settingsReducer from '../features/settings/settingsSlice';
import newsEventReducer from '../features/news-event/newsEventSlice';
import { CRYPTO_SECRET_KEY } from '../constants';
import CryptoJS from 'crypto-js';

const SECRET_KEY = CRYPTO_SECRET_KEY;
// Encrypt function
const encryptData = (data: any) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

// Decrypt function
const decryptData = (encryptedData: any) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// 🔒 Create encryption transform for transactions
const transactionEncryptTransform = createTransform(
  (inboundState) => encryptData(inboundState), // Encrypt before saving
  (outboundState) => decryptData(outboundState), // Decrypt when reading
);

const authPersistConfig = {
  key: 'auth',
  storage,
  transforms: [transactionEncryptTransform],
  whitelist: ['currentUser', 'isLoggedIn'],
};

const settingsPersistConfig = {
  key: 'settings',
  storage,
  transforms: [transactionEncryptTransform],
  whitelist: ['companyInfo',"userSettings","adminSettings"],
};
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedSettingsReducer = persistReducer(
  settingsPersistConfig,
  settingsReducer,
);

// Defining the store type
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    withdrawal: withdrawalReducer,
    user: userReducer,
    orders: ordersReducer,
    transaction: transactionReducer,
    support: supportReducer,
    settings: persistedSettingsReducer,
    newsEvent: newsEventReducer,
  },
});

export const persistor = persistStore(store);

// TypeScript types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
