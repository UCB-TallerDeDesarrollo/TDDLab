import { UserCreationObect } from "../Domain/User";
import { UserRepository } from "../Repositories/UserRepository";

export const registerUser = async (
    user: UserCreationObect,
    Adapter: UserRepository = new UserRepository()
) => {
  try {
    if (user.role === "admin") {
      throw new Error("No tiene permisos para registrar administradores");
    }
    
    const existingUser = await Adapter.obtainUserByemail(user.email);
    if (existingUser?.groupid?.includes(user.groupid)) {
      throw new Error("UserAlreadyExistsInThatGroup");
    }
    await Adapter.registerUser(user);
    return;
  } catch (error) {
    console.error("Error in the registration process:", error);
    throw error;
  }
};