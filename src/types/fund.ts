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

export interface IncomeTransaction {
  txUCode?: {
    username: string;
    name: string;
  };
  uCode?: {
    username: string;
    name: string;
  };
  txType: string;
  walletType: string;
  source: string;
  amount: number;
  txCharge: number;
  currentWalletBalance: number;
  postWalletBalance: number;
  remark: string;
  response: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFundTransaction {
  _id: string;
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
  tds?: number; // Tax Deducted at Source (if applicable)
  cryptoDetails?: number;
  wPool?: number;
  txCharge?: number;
  paymentSlip?: string;
  txNumber?: string;
  postWalletBalance?: number;
  currentWalletBalance?: number;
  method?: string | { _id: string; name?: string };
  account?: string | { _id: string; name?: string };
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
  remark?: string;
  reason?: string;
  status: number; // Status: 0 (Pending), 1 (Success), 2 (Failed)
  createdAt?: string;
  updatedAt?: string;
}

export interface IFundTransactionParams {
  [key: string]: string | number | boolean | null | undefined; // Or any other types based on your needs
}

export interface IUpdateUserFundTransactionPayload {
  status: number;
  reason?: string;
}
