import { UserRepository } from "../Repositories/UserRepository";

export const updateUserById = async (
  id: number,
  groupid:number,
  Adapter: UserRepository = new UserRepository()
) => {
  try {
    return await Adapter.updateUser(id,groupid);
  } catch (error) {
    console.error("Error obtaining User:", error);
    return { error: "Error obtaining User" };
  }
};