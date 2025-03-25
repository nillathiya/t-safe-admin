export interface IContactUs {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  status?: 'pending' | 'resolved';
  createdAt?: string;
  updatedAt?: string;
}
