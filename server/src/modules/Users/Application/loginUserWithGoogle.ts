import { getUserByemail } from "./getUserByemailUseCase";
import { getUserToken } from "./getUserToken";
import { TokenVerifier } from "../Domain/TokenVerifier";
import { FirebaseTokenVerifier } from "../Infrastructure/FirebaseTokenVerifier";
import { User } from "../Domain/User";
import admin from "firebase-admin";

export const loginUserWithGoogle = async (
  idToken: string,
  _: TokenVerifier = new FirebaseTokenVerifier()
): Promise<{ user: User; jwtToken: string }> => {
  //const email = await tokenVerifier.verifyAndExtractEmail(idToken);
  
  // Verificar el proveedor del token
  let email = "";
  try {
    console.log("Verifying Google token with Firebase Admin SDK");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded token:", decodedToken);
    email = decodedToken.email??"";
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
    console.log("Error verifying Google token:", error);
    if (error.message === "DEBE_USAR_GOOGLE") {
      throw error;
    }
    // Si no es el error de proveedor y el error es sobre token, relanzarlo
    if (error.message && !error.message.includes("Usuario no encontrado")) {
      throw error;
    }
  }

  const userResult = await getUserByemail(email);
  
  console.log("User result from database:", userResult);
  if (!userResult || "error" in userResult || userResult === null) {
    throw new Error("Usuario no encontrado");
  }

  const user = userResult as User;
  const jwtToken = await getUserToken(user);
  console.log("Generated JWT token:", jwtToken);
  return { user, jwtToken };
};

