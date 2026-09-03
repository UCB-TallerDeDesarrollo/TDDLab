import { UserOnDb } from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class CheckIfUserHasAccount {
  adapter: AuthRepository;

  constructor(
    loginRepository: AuthRepository = new AuthRepository()
  ) {
    this.adapter = loginRepository;
  }

  async userHasAnAccount(email: string) {
    try {
      const answerData: UserOnDb =
        await this.adapter.getAccountInfo(email);

      if (answerData.groupid) {
        return answerData;
      }

      return null;
    } catch (error) {
      console.error(
        "Error checking user account:",
        error
      );
      throw error;
    }
  }

  async userHasAnAccountWithGoogleToken(
    idToken: string
  ) {
    try {
      const answerData: UserOnDb =
        await this.adapter.getAccountInfoWithGoogleToken(
          idToken
        );

      if (answerData.groupid) {
        return answerData;
      }

      return null;
    } catch (error: any) {
      console.error(
        "Error checking Google user account:",
        error
      );

      if (error.message) {
        throw new Error(error.message);
      }

      throw error;
    }
  }
}