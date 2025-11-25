import { UserOnDb } from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class RegisterUserOnDb {
  adapter: AuthRepository;
  readonly mock: any;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async register(user: UserOnDb) {
    try {
      await this.adapter.registerAccount(user);
    } catch (error: any) {
      console.log("Error fetching user course:", error);

      const message = error?.message || "";

      if (message.includes("403") || message.includes("No tiene permisos")) {
        throw new Error("No tiene permisos para registrar administradores");
      }

      throw error;
    }
  }

  async registerWithGoogle(idToken: string, groupid: number, role: string) {
    try {
      await this.adapter.registerAccountWithGoogle(idToken, groupid, role);
    } catch (error: any) {
      const message = error?.message || "";

      if (message.includes("403") || message.includes("No tiene permisos")) {
        throw new Error("No tiene permisos para registrar administradores");
      }

      throw error;
    }
  }

  async verifyPass(pass: string): Promise<boolean> {
    return await this.adapter.verifyPassword(pass);
  }
  async getAccountInfo(email: string): Promise<UserOnDb | null> {
    try {
      const user = await this.adapter.getAccountInfo(email);
      return user;  // Retorna el usuario si existe
    } catch (error) {
      console.error("Error checking user:", error);
      return null;  // Si el usuario no existe, devuelve null
    }
  }
}

