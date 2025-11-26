import { UserOnDb } from "../domain/userOnDb.interface";
import AuthRepository from "../repository/LoginRepository";

export class CheckIfUserHasAccount {
  adapter: AuthRepository;
  constructor(loginRepository: AuthRepository = new AuthRepository()) {
    this.adapter = loginRepository;
  }

  async userHasAnAccount(email: string) {
    try {
      const answerData: UserOnDb = await this.adapter.getAccountInfo(email);
      console.log('User data retrieved:', answerData);
      
      if (answerData.groupid) {
        console.log('User has a group ID:', answerData.groupid);
        return answerData;
      } else {
        console.log('User does not have a group ID.');
        return null;
      }
    } catch (error) {
      console.error('Error checking user account:', error);
      throw error; // Ensure the error is propagated
    }
  }

   async userHasAnAccountWithToken(idToken: string) {
    try {
      const answerData: UserOnDb = await this.adapter.getAccountInfoWithToken(idToken);
      console.log('User data retrieved:', answerData);
      
      if (answerData.groupid) {
        console.log('User has a group ID:', answerData.groupid);
        return answerData;
      } else {
        console.log('User does not have a group ID.');
        return null;
      }
    } catch (error: any) {
      console.error('Error checking user account:', error);
      // Propagar el error con el mensaje original del servidor
      if (error.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async userHasAnAccountWithGoogleToken(idToken: string) {
    try {
      const answerData: UserOnDb = await this.adapter.getAccountInfoWithGoogleToken(idToken);
      
      if (answerData.groupid) {
        return answerData;
      } else {
        return null;
      }
    } catch (error: any) {
      // Propagar el error con el mensaje original del servidor
      if (error.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  }
}