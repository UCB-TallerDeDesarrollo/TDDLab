import { UserRole } from "./session.types";

export interface UserOnDb {
  id?: number;
  email: string;
  groupid: number | number[];
  role: UserRole;
}
