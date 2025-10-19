import { UserRepository } from "../Repositories/UserRepository";

export const getUserByemail = async (
  email: string,
  Adapter: UserRepository = new UserRepository()
) => {
  try {
    return await Adapter.obtainUserByemail(email);
  } catch (error) {
    console.error("Error obtaining User:", error);
    return { error: "Error obtaining User" };
  }
};
