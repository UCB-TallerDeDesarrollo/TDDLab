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

  async verifyPass(pass: string): Promise<boolean> {
    return await this.adapter.verifyPassword(pass);
  }
  async getAccountInfo(email: string): Promise<UserOnDb | null> {
    try {
      const user = await this.adapter.getAccountInfo(email);
      return user;  
    } catch (error) {
      console.error("Error checking user:", error);
      return null;
    }
  }
  
  async authenticateWithFirebase(idToken: string): Promise<UserOnDb> {
    try {
      const user = await this.adapter.getAccountInfoWithToken(idToken);
      return user;
    } catch (error) {
      console.error("Error authenticating with Firebase:", error);
      throw error;
    }
  }
}

