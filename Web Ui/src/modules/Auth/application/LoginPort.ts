import UserOnDb from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class PortLogin {
  adapter: AuthRepository;
  constructor(loginRepository: AuthRepository) {
    this.adapter = loginRepository;
  }

  async login(email: string) {
    let answerData: UserOnDb = await this.adapter.getAccountInfo(email);
    if (answerData.course) {
      return true;
    }
    return false;
  }
}
