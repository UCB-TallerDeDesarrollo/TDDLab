export interface UserDomain {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string;
  role?: string;
  groupid?: number | number[];
}
