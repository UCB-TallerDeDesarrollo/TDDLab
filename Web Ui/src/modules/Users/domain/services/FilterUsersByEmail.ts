
import { UserDataObject } from "../UsersInterface";

export type SearchParams = {
  query: string;
  groupId: number | "all";
};

export function filterUsersByEmail(
  users: UserDataObject[],
  { query, groupId }: SearchParams
): UserDataObject[] {
  const q = (query ?? "").trim().toLowerCase();

  return users
    .filter(u => (groupId === "all" ? true : u.groupid === groupId))
    .filter(u => u.email.toLowerCase().includes(q));
}
