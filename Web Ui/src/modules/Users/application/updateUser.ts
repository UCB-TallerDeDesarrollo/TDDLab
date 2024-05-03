import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";


export class UpdateUser {
  constructor(private userRepository: UsersRepositoryInterface) {}

  async updateUser(
    email: string,
    userData: UserDataObject,
  ) {
    try {
      // Ensure the assignment ID is included in the assignment data
      const updatedUserData: UserDataObject = {
        ...userData,
        email: email,
      };

      // Call the updateAssignment method from the repository
      await this.userRepository.updateUser(
        email,
        updatedUserData,
      );
    } catch (error) {
      // Handle any errors that may occur during the update process
      console.error("Error updating user:", error);
      throw error;
    }
  }
}
