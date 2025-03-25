export interface Support {
  _id: string;
  uCode: {
    _id: string;
    name: string;
    username: string;
  };
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  subject: string;
  ticket: string;
  msgBy: string;
  status: number;
  replyStatus: number;
  createdAt: string;
  updatedAt: string;
  approvedDate: string;
  reply: string;
}

export interface Tickets {
  _id: string;
  unreadMessages: {
    admin: number;
    user: number;
  };
  userId?: {
    _id: string;
    username: string;
    name: string;
  };
  title?: string;
  description?: string;
  messages?: TicketMessage[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  sender: string;
  text: string;
  isRead: boolean;
}
