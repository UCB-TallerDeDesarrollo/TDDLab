import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

export class UpdateUser {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async updateUser(id: number, groupid: number) {
    try {
      // Ensure the assignment ID is included in the assignment data

      // Call the updateAssignment method from the repository
      await this.userRepository.updateUser(id, groupid);
    } catch (error) {
      // Handle any errors that may occur during the update process
      console.error("Error updating user:", error);
      throw error;
    }
  }
}
