import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";


export class UpdateUser {
  constructor(private userRepository: UsersRepositoryInterface) {}

  async updateUser(
    id: number,
    userData: UserDataObject,
  ) {
    try {
      // Ensure the assignment ID is included in the assignment data
      const updatedUserData: UserDataObject = {
        ...userData,
        id: id,
      };

      // Call the updateAssignment method from the repository
      await this.userRepository.updateUser(
        id,
        updatedUserData,
      );
    } catch (error) {
      // Handle any errors that may occur during the update process
      console.error("Error updating user:", error);
      throw error;
    }
  }
}
