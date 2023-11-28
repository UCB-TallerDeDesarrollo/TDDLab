import UserOnDb from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class CheckIfUserHasAccount {
  adapter: AuthRepository;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async userHasAnAcount(email: string) {
    let answerData: UserOnDb = await this.adapter.getAccountInfo(email);
    if (answerData.course) {
      return answerData.course;
    }
    return null;
  }
}
