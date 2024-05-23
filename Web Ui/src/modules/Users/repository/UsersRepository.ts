import axios from "axios";
import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

const API_URL = "https://tdd-lab-api-gold.vercel.app/api/user/users"; //http://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/

class UsersRepository implements UsersRepositoryInterface {

  async getUserById(id: number): Promise<UserDataObject> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }
  async getUsers(): Promise<UserDataObject[]> {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
  async getUsersByGroupid(groupid: number): Promise<UserDataObject[]>{
    try{
      const response = await axios.get(`${API_URL}/groupid/${groupid}`);
      return response.data;
    }catch(error){
      console.error("Error fetching users by group ID:", error);
      throw error
    }
  }
  async getUserByEmail(email: string): Promise<UserDataObject | null> {
    try {
      const response = await axios.get(`${API_URL}/${email}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }
  async updateUser(id: number, groupid: number): Promise<void> {
    try {
      await axios.put(`${API_URL}/${id}`,{groupid});
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  async getUserEmailById(id: number): Promise<string> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.email;
    } catch (error) {
      console.error("Error fetching user email by ID:", error);
      throw error;
    }
  }
}

export default UsersRepository;