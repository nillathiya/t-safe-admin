export interface Order {
  _id:string;
  customerId?: {
    username: string;
    name: string;
  };
  pinId?: {
    pinType: string;
    pinRate: number;
    bv: string;
    status: number;
  };
  activeId: number;
  txType: string;
  bv: number;
  pv: string;
  payOutStatus: number;
  amount: number;
  status: number;
  createdAt:string;
  updatedAt: string;
}
