import { filterUsersByEmail, SearchParams } from "../domain/services/FilterUsersByEmail";
import { UserDataObject } from "../domain/UsersInterface";

export class SearchUsersByEmail {
  execute(users: UserDataObject[], params: SearchParams): UserDataObject[] {
    return filterUsersByEmail(users, params);
  }
}