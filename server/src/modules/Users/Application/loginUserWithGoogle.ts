import { getUserByemail } from "./getUserByemailUseCase";
import { getUserToken } from "./getUserToken";
import { TokenVerifier } from "../Domain/TokenVerifier";
import { FirebaseTokenVerifier } from "../Infrastructure/FirebaseTokenVerifier";
import { User } from "../Domain/User";
import admin from "firebase-admin";

export const loginUserWithGoogle = async (
  idToken: string,
  tokenVerifier: TokenVerifier = new FirebaseTokenVerifier()
): Promise<{ user: User; jwtToken: string }> => {
  const email = await tokenVerifier.verifyAndExtractEmail(idToken);
  
  // Verificar el proveedor del token
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseData = decodedToken.firebase as any;
    const providerId = firebaseData?.sign_in_provider;
    
    // Si el token no es de Google, verificar si el usuario existe
    // Si existe, significa que está usando el proveedor equivocado
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
    // Si no es el error de proveedor y el error es sobre token, relanzarlo
    if (error.message && !error.message.includes("Usuario no encontrado")) {
      throw error;
    }
  }

  const userResult = await getUserByemail(email);
  
  if (!userResult || "error" in userResult || userResult === null) {
    throw new Error("Usuario no encontrado");
  }

  const user = userResult as User;
  const jwtToken = await getUserToken(user);
  
  return { user, jwtToken };
};

