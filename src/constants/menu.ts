import { ICONS } from './icons';
let uniqueId = 0;
const generateUniqueId = () => ++uniqueId;

export const MENU: {
  id: number;
  title: string;
  path: string;
  icon: keyof typeof ICONS;
  children: {
    id: number;
    title: string;
    path: string;
    icon: keyof typeof ICONS;
  }[];
}[] = [
  {
    id: generateUniqueId(),
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'DASHBOARD',
    children: [],
  },
  {
    id: generateUniqueId(),
    title: 'Users',
    path: '/users',
    icon: 'USER',
    children: [
      {
        id: generateUniqueId(),
        title: 'All Users',
        path: '/users/all-users',
        icon: 'USER',
      },
      {
        id: generateUniqueId(),
        title: 'User Reward',
        path: '/users/member',
        icon: 'USER',
      },
      {
        id: generateUniqueId(),
        title: 'Add Member',
        path: '/users/reward',
        icon: 'USER',
      },
    ],
  },

  {
    id: generateUniqueId(),
    title: 'Network',
    path: '/network',
    icon: 'NETWORK',
    children: [
      {
        id: generateUniqueId(),
        title: 'Generation Team',
        path: '/network/team',
        icon: 'DASHBOARD',
      },
    ],
  },
  {
    id: generateUniqueId(),
    title: 'Withdrawal',
    path: '/withdrawal',
    icon: 'WIDTHDRAWAL',
    children: [
      {
        id: generateUniqueId(),
        title: 'Pending',
        path: '/withdrawal/pending',
        icon: 'WIDTHDRAWAL',
      },
      {
        id: generateUniqueId(),
        title: 'Approved',
        path: '/withdrawal/approved',
        icon: 'WIDTHDRAWAL',
      },
      {
        id: generateUniqueId(),
        title: 'Cancelled',
        path: '/withdrawal/cancelled',
        icon: 'WIDTHDRAWAL',
      },
    ],
  },
  {
    id: generateUniqueId(),
    title: 'Orders',
    path: '/order',
    icon: 'ORDER',
    children: [],
  },
  {
    id: generateUniqueId(),
    title: 'Income',
    path: '/income',
    icon: 'INCOME',
    children: [],
  },
  {
    id: generateUniqueId(),
    title: 'Fund',
    path: '/fund',
    icon: 'FUND',
    children: [
      {
        id: generateUniqueId(),
        title: 'Add Fund',
        path: '/fund/add-fund',
        icon: 'FUND',
      },
      {
        id: generateUniqueId(),
        title: 'Fund Transfer History',
        path: '/fund/fund-transfer',
        icon: 'FUND',
      },
      {
        id: generateUniqueId(),
        title: 'Deposit Request',
        path: '/fund/deposit-request',
        icon: 'FUND',
      },
      {
        id: generateUniqueId(),
        title: 'Deposit Histroy',
        path: '/fund/deposit-history',
        icon: 'FUND',
      },
      {
        id: generateUniqueId(),
        title: 'Cash Deposit Request',
        path: '/fund/cash-deposit-request',
        icon: 'FUND',
      },
      {
        id: generateUniqueId(),
        title: 'Cash Deposit History',
        path: '/fund/cash-deposit-history',
        icon: 'FUND',
      },
    ],
  },

  {
    id: generateUniqueId(),
    title: 'Support',
    path: '/support',
    icon: 'MDOUTLINESUPPORT',
    children: [
      {
        id: generateUniqueId(),
        title: 'Support',
        path: '/support',
        icon: 'MDOUTLINESUPPORT',
      },
    ],
  },

  {
    id: generateUniqueId(),
    title: 'Contact Us',
    path: '/Contact',
    icon: 'CONTACTUs',
    children: [],
  },
  {
    id: generateUniqueId(),
    title: 'Setting',
    path: '/setting',
    icon: 'IOSETTINGS',
    children: [
      {
        id: generateUniqueId(),
        title: 'General settings',
        path: '/setting/general-setting',
        icon: 'USER',
      },
      {
        id: generateUniqueId(),
        title: 'News & Events',
        path: '/setting/news-and-events',
        icon: 'USER',
      },
    ],
  },
  {
    id: generateUniqueId(),
    title: 'Change Password',
    path: '/password/change-password',
    icon: 'MDOUTLINEPASSWORD',
    children: [],
  },
  {
    id: generateUniqueId(),
    title: 'Logout',
    path: '#',
    icon: 'CILOGOUT',
    children: [],
  },
];
