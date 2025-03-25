export interface User {
  _id: string;
  // User Hierarchy & Relations
  parentId?: Schema.Types.ObjectId;
  uSponsor?: {
    _id: string;
    username: string;
    name: string;
  };
  // Personal Information
  name?: string;
  email?: string;
  password?: string;
  mobile?: string;
  username?: string;
  dob?: Date;
  gender?: string;
  profilePicture?: string;

  // Address Information
  address?: {
    line1?: string;
    line2?: string;
    city?: {
      label?: string;
      value?: string;
    };
    state?: {
      label?: string;
      value?: string;
    };
    country?: {
      dialCode?: string;
      label?: string;
      value?: string;
    };
    countryCode?: string;
    postalCode?: string;
  };

  // Account & Status
  accountStatus?: {
    activeId?: number;
    activeStatus?: number;
    blockStatus?: number;
    activeDate?: Date;
  };
  role?: number; // 1 - Admin, 2 - User
  status?: number; // 1 - Active, 0 - Inactive
  ip?: string;
  source?: string;
  resetPasswordToken?: string;
  settings?: Record<string, unknown>;

  // Wallet & Payment
  walletId?: Schema.Types.ObjectId;
  walletAddress?: string;
  payment?: {
    paymentId?: string;
    amount?: number;
    dateTime?: Date;
  };
  withdrawStatus?: number;

  // Plan & Validity
  validityDate?: Date;
  planName?: string;

  // KYC Information
  kycStatus?: number; // 0 - Rejected, 1 - Approved, 2 - Pending
  reason?: string;
  panCard?: {
    panNo?: string;
    image?: string;
  };
  identityProof?: {
    proofType?: 'Adhaar' | 'VoterID' | 'Passport' | 'Driving License';
    proofNumber?: string;
    image1?: string;
    image2?: string;
  };

  // Banking & UPI Details
  bankDetails?: {
    account?: string;
    IFSC?: string;
    bank?: string;
    accountType?: string;
  };
  cryptoAddress?: string;
  upi?: {
    gPay?: string;
    phonePe?: string;
    bharatPe?: string;
    payTM?: string;
    upiId?: string;
  };

  // Nominee Details
  nominee?: {
    name?: string;
    relation?: string;
    dob?: Date;
    address?: string;
    city?: string;
    state?: string;
  };

  // Matrix / Multi-Level Marketing Data
  position?: number;
  accessLevel?: number[];
  myRank?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
