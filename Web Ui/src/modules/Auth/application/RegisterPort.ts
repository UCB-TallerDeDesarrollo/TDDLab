import UserOnDb from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class RegisterPort {
  adapter: AuthRepository;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async register(user: UserOnDb) {
    await this.adapter.registerAccount(user);
  }
}
