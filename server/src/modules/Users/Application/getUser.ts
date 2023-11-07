import { UserRepository } from "../Repositories/UserRepository";

export const getUser = async (
  email: string,
  Adapter: UserRepository = new UserRepository()
) => {
  try {
    return await Adapter.obtainUser(email);
  } catch (error) {
    console.error("Error obtaining User:", error);
    return { error: "Error obtaining User" };
  }
};
