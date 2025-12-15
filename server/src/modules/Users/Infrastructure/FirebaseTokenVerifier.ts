import admin from "firebase-admin";
import { TokenVerifier } from "../Domain/TokenVerifier";

export class FirebaseTokenVerifier implements TokenVerifier {
  async verifyAndExtractEmail(idToken: string): Promise<string> {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      
      if (!decoded.email) {
        throw new Error("No se pudo obtener email de Firebase");
      }

      return decoded.email;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          throw new Error("Token expirado");
        }
        if (error.message.includes("invalid")) {
          throw new Error("Token inválido");
        }
      }
      throw new Error("Token inválido o expirado");
    }
  }
}

