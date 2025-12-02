import axios from "axios";
import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";
import {VITE_API} from "../../../../config.ts";
import { SearchParams } from "../domain/SearchParamsInterface.ts";

const API_URL = VITE_API + "/user/users";

export class UsersRepository implements UsersRepositoryInterface {

  async getUserById(id: number): Promise<UserDataObject> {
    try {
      const response = await axios.get(`${API_URL}/${id}`,{ withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }
  async getUsers(): Promise<UserDataObject[]> {
    try {
      const response = await axios.get(API_URL,{ withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
  async getUsersByGroupid(groupid: number): Promise<UserDataObject[]>{
    try{
      const response = await axios.get(`${API_URL}/groupid/${groupid}`,{ withCredentials: true });
      return response.data;
    }catch(error){
      console.error("Error fetching users by group ID:", error);
      throw error
    }
  }
  async getUserByEmail(email: string): Promise<UserDataObject | null> {
    try {
      const response = await axios.get(`${API_URL}/${email}`,{ withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }
  async updateUser(id: number, groupid: number): Promise<void> {
    try {
      await axios.put(`${API_URL}/${id}`,{groupid},{ withCredentials: true });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  async getUserEmailById(id: number): Promise<string> {
    try {
      const response = await axios.get(`${API_URL}/${id}`,{ withCredentials: true });
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
      await axios.delete(`${API_URL}/delete/${userId}`,{ withCredentials: true });
      
      console.log(`Usuario con ID ${userId} eliminado exitosamente.`);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  }

  async getFilteredUsersByEmail(params: SearchParams): Promise<UserDataObject[]> {
  const { query, groupId } = params;
  const users = await this.getUsers();

  const filteredByGroup = groupId === "all"
    ? users
    : users.filter((user) => user.groupid === groupId);

  return filteredByGroup.filter((user) =>
    user.email.toLowerCase().includes(query.toLowerCase())
  );
}

}

export default UsersRepository;