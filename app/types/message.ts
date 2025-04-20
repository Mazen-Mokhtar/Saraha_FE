export interface Message {
  _id: string;
  content: string;
  date: string;
  read: boolean;
  senderId: string;
  resverId: string;
}

export interface MessageResponse {
  success: boolean;
  allMessage: Message[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
}