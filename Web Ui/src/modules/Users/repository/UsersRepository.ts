import axios from "axios";
import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

const API_URL = "https://tdd-lab-api-gold.vercel.app/api/users";

class UsersRepository implements UsersRepositoryInterface {
  async getUsers(): Promise<UserDataObject[]> {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
}

export default UsersRepository;