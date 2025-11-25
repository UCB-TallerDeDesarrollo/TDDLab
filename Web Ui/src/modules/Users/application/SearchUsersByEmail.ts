import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";
import { SearchParams } from "../domain/SearchParamsInterface";

export class SearchUsersByEmail {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async execute(params: SearchParams): Promise<UserDataObject[]> {
    return await this.userRepository.getFilteredUsersByEmail(params);
  }
}
