
import { UserDataObject } from "../UsersInterface";

export interface SearchParams {
  query: string;
  groupId: number | "all";
}

export function filterUsersByEmail(
  users: UserDataObject[],
  params: SearchParams
): UserDataObject[] {

  const { query, groupId } = params;

  return users
    .filter(user =>
      groupId === "all" ? true : user.groupid === groupId
    )
    .filter(user =>
      user.email.toLowerCase().includes(query.toLowerCase())
    );
}
