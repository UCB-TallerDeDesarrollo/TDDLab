// application/CheckIfUserHasAccount.ts
import { OAuthProvider } from "../domain/AuthManager";
import { AuthDBRepositoryInterface } from "../domain/LoginRepositoryInterface";
import { UserOnDb } from "../domain/userOnDb.interface";

export class CheckIfUserHasAccount {
  constructor(private readonly repository: AuthDBRepositoryInterface) {}

  async execute(idToken: string, provider: OAuthProvider = OAuthProvider.Google): Promise<UserOnDb | null> {
    try {
      const userOnDb = await this.repository.getAccountInfoWithToken(idToken, provider);

      // Valida que el usuario tenga un groupid asignado en la base de datos
      if (!userOnDb || userOnDb.groupid === undefined || userOnDb.groupid === null) {
        return null;
      }

      return userOnDb;
    } catch (error: any) {
      throw new Error(error?.message || "Error al verificar la cuenta del usuario.");
    }
  }
}
