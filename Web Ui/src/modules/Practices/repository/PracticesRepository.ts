import axios from "axios";
import { PracticeDataObject } from "../domain/PracticeInterface";
import PracticeRepositoryInterface from "../domain/PracticeRepositoryInterface";
import { VITE_API } from "../../../../config";
const API_URL = VITE_API + "/practices";

class PracticesRepository implements PracticeRepositoryInterface {
  async getPractices(): Promise<PracticeDataObject[]> {
    try {
      const response = await axios.get(API_URL);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch practices");
      }
    } catch (error) {
      console.error("Error fetching practices:", error);
      throw error;
    }
  }

  async getPracticeById(
    practiceId: number
  ): Promise<PracticeDataObject | null> {
    try {
      const response = await axios.get(`${API_URL}/${practiceId}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch practices by ID");
      }
    } catch (error) {
      console.error("Error fetching practices by ID:", error);
      throw error;
    }
  }

  async getPracticeByUserId(
    userid: number | undefined
  ): Promise<PracticeDataObject[]> {
    try {
      const response = await axios.get(`${API_URL}/user/${userid}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch practices by USER ID");
      }
    } catch (error) {
      console.error("Error fetching practices by USER ID:", error);
      throw error;
    }
  }

  async createPractice(practiceData: PracticeDataObject): Promise<void> {
    await axios.post(API_URL, practiceData);
  }

  async updatePractice(
    practiceId: number,
    practiceData: PracticeDataObject
  ): Promise<void> {
    await axios.put(`${API_URL}/${practiceId}`, practiceData);
  }

  async deletePractice(practiceId: number): Promise<void> {
    try {
      const response = await axios.delete(`${API_URL}/${practiceId}`);

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to delete assignment by ID");
      }
    } catch (error) {
      console.error("Error deleting assignment by ID:", error);
      throw error;
    }
  }
}

export default PracticesRepository;
