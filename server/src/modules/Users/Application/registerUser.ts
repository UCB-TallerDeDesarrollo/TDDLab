import { UserCreationObect } from "../Domain/User";
import { UserRepository } from "../Repositories/UserRepository";

export const registerUser = async (
    user: UserCreationObect,
    Adapter: UserRepository = new UserRepository()
) => {
  try {
    const existingUser = await Adapter.obtainUserByemail(user.email);
    if (existingUser) {
      throw new Error("UserAlreadyExists");
    }
    await Adapter.registerUser(user);
    return;
  } catch (error) {
    console.error("Error in the registration process:", error);
    throw error;
  }
};