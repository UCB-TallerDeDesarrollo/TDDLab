import { UserOnDb } from "../../User-Authentication/domain/userOnDb.interface";

export async function updateUserById(
  userId: number,
  userData: Partial<UserOnDb>,
): Promise<UserOnDb> {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar el usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateUserById:", error);
    throw error;
  }
}