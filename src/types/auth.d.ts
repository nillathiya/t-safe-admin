export interface AdminUser {
  _id: string;
  role: number;
  username: string;
  amount: number;
  password: string;
  email: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
