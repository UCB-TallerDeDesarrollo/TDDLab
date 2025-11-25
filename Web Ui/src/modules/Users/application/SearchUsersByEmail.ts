import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";
import { SearchParams } from "../domain/SearchParamsInterface";

export class SearchUsersByEmail {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async execute(params: SearchParams): Promise<UserDataObject[]> {
    const { query, groupId } = params;

    const users = await this.userRepository.getUsers();
    const filteredByGroup = groupId === "all"
      ? users
      : users.filter((user) => user.groupid === groupId);

    return filteredByGroup.filter((user) =>
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  }
}
