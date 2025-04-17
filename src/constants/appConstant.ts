// Env constants
export const CRYPTO_SECRET_KEY = import.meta.env.VITE_APP_CRYPTO_SECRET_KEY;
export const USER_API_URL = import.meta.env.VITE_USER_API_URL;

// Pagination
// export const DEFAULT_ITEMS_PER_PAGE = 5;
export const DEFAULT_CURRENT_PAGE = 0;
export const DEFAULT_PER_PAGE_ITEMS = 5;

// Income
export const INCOME_FIELDS = {
  roi: 'Staking Reward',
  direct: 'Profile Sharing Reward',
  reward: 'ARB Bonus Reward',
  royalty: 'Royalty Income',
};
