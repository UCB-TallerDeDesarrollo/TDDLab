// In getUsersByGroupId.ts

import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

class GetUsersByGroupId {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async execute(groupid: number): Promise<UserDataObject[]> {
    return await this.userRepository.getUsersByGroupid(groupid);
  }
}

export default GetUsersByGroupId;
