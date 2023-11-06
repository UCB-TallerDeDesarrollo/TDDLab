import axios from "axios"; // Import Axios or your preferred HTTP library
import AuthDBRepositoryInterface from "../domain/LoginRepositoryInterface";
import UserOnDb from "../domain/userOnDb.interface";

const API_URL = "https://tdd-lab-api-gold.vercel.app/api";

class AuthRepository implements AuthDBRepositoryInterface {
  async getAccountInfo(email: string): Promise<UserOnDb> {
    try {
      const response = await axios.get(API_URL + "/users/" + email);

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get user Course");
      }
    } catch (error) {
      console.error("Error fetching user course:", error);
      throw error;
    }
  }
  async registerAccount(user: UserOnDb): Promise<void> {
    try {
      await axios.post(API_URL + "/users", user);
    } catch (error) {
      console.error("Error saving user", error);
      throw error;
    }
  }
}

export default AuthRepository;
