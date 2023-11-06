import UserOnDb from "../domain/userOnDb.interface";
import LoginRepository from "../repository/LoginRepository";

export class PortLogin {
  adapter: LoginRepository;
  constructor(loginRepository: LoginRepository) {
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
