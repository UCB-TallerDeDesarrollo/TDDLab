import { UserRepository } from "../Repositories/UserRepository";

export const removeUser = async (
  userId: number,
  Adapter: UserRepository = new UserRepository()
): Promise<void> => {
  try {
    // Verifica si el usuario pertenece al grupo antes de eliminarlo
    console.log(userId)
    await Adapter.removeUserFromGroup(userId);
    
  } catch (error) {
    console.error("Error removing user from group:", error);
    throw error; // Lanza el error para que la capa superior pueda manejarlo
  }
};
