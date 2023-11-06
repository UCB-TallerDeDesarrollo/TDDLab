import axios from "axios"; // Import Axios or your preferred HTTP library
import LoginRepositoryInterface from "../domain/LoginRepositoryInterface";
import UserOnDb from "../domain/userOnDb.interface";

const API_URL = "https://tdd-lab-api-gold.vercel.app/api/";

class LoginRepository implements LoginRepositoryInterface {
  async getAccountInfo(email: string): Promise<UserOnDb> {
    try {
      // Send a GET request to fetch assignments from the backend
      const response = await axios.get(API_URL + "users/" + email);

      // Check if the response status is successful (e.g., 200 OK)
      if (response.status === 200) {
        // Return the assignments data from the response
        return response.data;
      } else {
        // Handle other response status codes or errors here if needed
        throw new Error("Failed to get user Course");
      }
    } catch (error) {
      // Handle any network errors or exceptions that may occur
      console.error("Error fetching user course:", error);
      throw error;
    }
  }
}

export default LoginRepository;
