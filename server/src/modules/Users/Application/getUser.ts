import { UserRepository } from "../Repositories/UserRepository";

export const getUser = async (
  id: number,
  Adapter: UserRepository = new UserRepository()
) => {
  try {
    return await Adapter.obtainUser(id);
  } catch (error) {
    console.error("Error obtaining User:", error);
    return { error: "Error obtaining User" };
  }
};
