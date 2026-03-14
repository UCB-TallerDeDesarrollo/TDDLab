export interface User {
  id: number;
  email: string;
  groupid: number[];
  role: string;
  firstName: string;
  lastName: string;
}

export interface UserCreationObect{
  email: string;
  groupid: number;
  role: string;
  firstName: string;
  lastName: string;
}