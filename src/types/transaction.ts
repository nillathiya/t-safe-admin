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

export interface FundTransaction {
  txUCode?: {
    _id: string;
    username: string;
    name: string;
  }; // User ID (Receiver)
  uCode?: {
    _id: string;
    username: string;
    name: string;
  };
  txType: string;
  debitCredit: string; // "DEBIT" or "CREDIT"
  fromWalletType?: string;
  walletType: string; // "FUND_WALLET" , "MAIN_WALLET"
  amount: number;
  txCharge?: number;
  tds?: number; // Tax Deducted at Source (if applicable)
  cryptoDetails?: number;
  wPool?: number;
  paymentSlip?: string;
  txNumber?: string;
  currentWalletBalance: number;
  postWalletBalance: number;
  method?: string;
  response?: string;
  remark?: string;
  reason?: string;
  isRetrieveFund?: boolean;
  status?: number; // Status: 0 (Pending), 1 (Success), 2 (Failed)
}
