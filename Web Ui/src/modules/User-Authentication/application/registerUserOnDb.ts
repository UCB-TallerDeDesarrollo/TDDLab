import UserOnDb from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class RegisterUserOnDb {
  adapter: AuthRepository;
  static mock: unknown;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async register(user: UserOnDb) {
    await this.adapter.registerAccount(user);
  }

  async verifyPass(pass: string): Promise<boolean> {
    return await this.adapter.verifyPassword(pass);
  }
}
