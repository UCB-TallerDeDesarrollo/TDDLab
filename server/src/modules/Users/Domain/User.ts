export interface User {
  id: number;
  email: string;
  groupid: number[];
  role: string;
}

export interface UserCreationObect{
  email: string;
  groupid: number;
  role: string;
}