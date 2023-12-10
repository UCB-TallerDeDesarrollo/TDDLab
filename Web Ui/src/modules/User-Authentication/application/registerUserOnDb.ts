import UserOnDb from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class RegisterUserOnDb {
  adapter: AuthRepository;
  static mock: any;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async register(user: UserOnDb, password: string | null) {
    await this.adapter.registerAccount(user, password);
  }
}
