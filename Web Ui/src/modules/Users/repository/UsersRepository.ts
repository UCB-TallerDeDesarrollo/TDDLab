import axios from "axios";
import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

const API_URL = "https://tdd-lab-api-gold.vercel.app/api/user/users"; //tdd-lab-api-gold.vercel.app

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
  async updateUser(email: string, userData: UserDataObject): Promise<void> {
    try {
      // Primero, obtenemos todos los usuarios
      const response = await axios.get(API_URL);
      const allUsers = response.data;
  
      // Buscamos el usuario con el correo electrónico proporcionado
      const userToUpdate = allUsers.find((user: UserDataObject) => user.email === email);
      console.log("encontre a este usuario",userToUpdate);
      // Verificamos si se encontró al usuario
      if (!userToUpdate) {
        throw new Error(`Usuario con correo electrónico ${email} no encontrado`);
      }
  
      // Si se encontró al usuario, realizamos la actualización
      await axios.put(`${API_URL}/${email}`, userData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}

export default UsersRepository;