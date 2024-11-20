import { UserOnDb } from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class RegisterUserOnDb {
  adapter: AuthRepository;
  readonly mock: any;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async register(user: UserOnDb) {
    await this.adapter.registerAccount(user);
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

