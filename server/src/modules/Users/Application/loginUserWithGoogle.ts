import { getUserByemail } from "./getUserByemailUseCase";
import { getUserToken } from "./getUserToken";
import { User } from "../Domain/User";
import admin from "firebase-admin";

export const loginUserWithGoogle = async (
  idToken: string
): Promise<{ user: User; jwtToken: string }> => {
  let email = "";

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    email = decodedToken.email || "";

    if (!email) {
      throw new Error("No se pudo obtener email de Firebase");
    }

    const firebaseData = decodedToken.firebase as any;
    const providerId = firebaseData?.sign_in_provider;

    if (providerId && providerId !== "google.com") {
      const userResult = await getUserByemail(email);
      if (userResult && !("error" in userResult) && userResult !== null) {
        throw new Error("DEBE_USAR_GOOGLE");
      }
      throw new Error("Usuario no encontrado");
    }
  } catch (error: any) {
    if (error.message === "DEBE_USAR_GOOGLE") {
      throw error;
    }
    if (error.message === "Usuario no encontrado") {
      throw error;
    }
    if (error.message === "No se pudo obtener email de Firebase") {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        throw new Error("Token expirado");
      }
      if (error.message.includes("invalid")) {
        throw new Error("Token inválido");
      }
    }

    if (error.message) {
      throw error;
    }

    throw new Error("Token inválido o expirado");
  }

  const userResult = await getUserByemail(email);
  
  if (!userResult || "error" in userResult || userResult === null) {
    throw new Error("Usuario no encontrado");
  }

  const user = userResult as User;
  const jwtToken = await getUserToken(user);
  
  return { user, jwtToken };
};

