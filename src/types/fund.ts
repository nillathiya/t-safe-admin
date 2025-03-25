interface Item {
  key: string;
  label: string;
  symbol: string;
  image?: string;
  status: boolean;
}
export interface IDepositMethod {
  _id: string;
  name: string;
  slug: string;
  currency: Item[];
  status: number;
  adminStatus: number;
}

export interface IDepositAccount {
  _id: string;
  name: string;
  slug: string;
  methodId: string;
  type: 'auto' | 'manual';
  value?: Item[];
  status: number;
  adminStatus: number;
  currencyKey: string;
}

export interface IFundTransaction {
  _id?: string;
  txUCode?: {
    _id: string;
    username: string;
    name: string;
  };
  uCode: {
    _id: string;
    username: string;
    name: string;
  };
  txType?: string;
  debitCredit?: string;
  fromWalletType?: string;
  walletType?: string; // "FUND_WALLET", "MAIN_WALLET"
  amount?: number;
  txCharge?: number;
  paymentSlip?: string;
  txNumber?: string;
  postWalletBalance?: number;
  currentWalletBalance?: number;
  method?: string;
  account?: string;
  withdrawalAccount?:
    | string
    | {
        _id: string;
        userId: string;
        accountTypeId: {
          _id: string;
          name: string;
          requiredFields: { [key: string]: string };
        };
        details: { [key: string]: string };
      };
  response?: string;
  isRetrieveFund: boolean;
  status: number; // 0, 1, 2
  createdAt?: string;
  updatedAt?: string;
}
