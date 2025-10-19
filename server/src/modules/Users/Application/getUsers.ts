import { UserRepository } from "../Repositories/UserRepository";

export const getUsers = async (
  Adapter: UserRepository = new UserRepository()
) => {
  try {
    return await Adapter.obtainUsers();
  } catch (error) {
    console.error("Error obtaining Users:", error);
    return { error: "Error obtaining Users" };
  }
};
