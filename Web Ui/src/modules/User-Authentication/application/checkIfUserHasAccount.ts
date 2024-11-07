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
}

// async userHasAnAccount(email: string) {
//   try {
//     const answerData: UserOnDb = await this.adapter.getAccountInfo(email);
//     console.log('User data retrieved:', answerData);
    
//     if (answerData && answerData.groupid) {
//       if (answerData.groupid === 67) {
//         // Si el usuario está en el grupo 67, lo aceptamos como válido
//         console.log('User is in group 67:', answerData.groupid);
//         return answerData;
//       } else {
//         // Si el usuario está en cualquier otro grupo
//         console.log('User has a group ID:', answerData.groupid);
//         return answerData;
//       }
//     } else {
//       // Si no tiene un groupid
//       console.log('User does not have a group ID.');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error checking user account:', error);
//     throw error; // Ensure the error is propagated
//   }
// }
// }  