import axios from "axios";
import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";
import {VITE_API} from "../../../../config.ts";

const API_URL = VITE_API + "/user/users";

export class UsersRepository implements UsersRepositoryInterface {

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

  async removeUserFromGroup(userId: number): Promise<void> {
    if (!userId) {
      throw new Error("El ID de usuario no es válido.");
    }
  
    try {
      console.log("repository"+userId)
      await axios.delete(`${API_URL}/delete/${userId}`);
      
      console.log(`Usuario con ID ${userId} eliminado exitosamente.`);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }
}

export default UsersRepository;