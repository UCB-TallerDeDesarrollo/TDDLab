import axios from "axios"; // Import Axios or your preferred HTTP library
import AuthDBRepositoryInterface from "../domain/LoginRepositoryInterface";
import { UserOnDb } from "../domain/userOnDb.interface";
import {VITE_API} from "../../../../config.ts";

const API_URL = VITE_API;

class AuthRepository implements AuthDBRepositoryInterface {
  async getAccountInfo(email: string): Promise<UserOnDb> {
    try {
      const response = await axios.post(API_URL + "/user/login", {
        email: email,
      });

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

  async getAccountInfoWithToken(idToken: string): Promise<UserOnDb> {
    try {
      const response = await axios.post(API_URL + "/user/github",
      { idToken },
      { withCredentials: true } );
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get user Course");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || "Error al obtener información del usuario";
        throw new Error(errorMessage);
      }
      console.error("Error fetching user course:", error);
      throw error;
    }
  }

  async getAccountInfoWithGoogleToken(idToken: string): Promise<UserOnDb> {
    try {
      const response = await axios.post(API_URL + "/user/google",
      { idToken },
      { withCredentials: true } );
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get user Course");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error || "Error al obtener información del usuario";
        throw new Error(errorMessage);
      }
      console.error("Error fetching user course:", error);
      throw error;
    }
  }

  async registerAccount(user: UserOnDb): Promise<void> {
  try {
    const response = await axios.post(API_URL + "/user/register", user);

    return response.data;
  } catch (error: unknown) {
    console.error("Error saving user", error);

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 403) {
        throw new Error("No tiene permisos para registrar administradores");
      }

      throw new Error(
        error.response.data?.error || "Error al registrar usuario"
      );
    }

    throw new Error("Error saving user");

  }
}

  async registerAccountWithGoogle(idToken: string, groupid: number, role: string): Promise<void> {
    try {
      const response = await axios.post(API_URL + "/user/register/google", {
        idToken,
        groupid,
        role,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          throw new Error("No tiene permisos para registrar administradores");
        }

        throw new Error(
          error.response.data?.error || "Error al registrar usuario con Google"
        );
      }

      throw new Error("Error saving user with Google");
  }
}


  async verifyPassword(password: string): Promise<boolean> {
    try {

      const response = await axios.post(API_URL + "/user/verifyPassword", {
        password: password,
      });
      console.log("Aqui en el segundo verify")

      return response.data.success;
    } catch (error: unknown) {  
      if (axios.isAxiosError(error)) { 
        if (error.response) {
          console.error("Error response:", error.response.data);
          if (error.response.status === 401) {
            alert("Contraseña incorrecta. Por favor ingresa una contraseña valida");  
          } else {
            alert(error.response.data.message || "Error en el servidor");
          }
        } else if (error.request) {
          console.error("Error request:", error.request);
          alert("Error de red: No se pudo conectar con el servidor");
        }
      } else {
        console.error("Error:", error);
        alert("Error desconocido");
      }
      throw error;
    }
  }

  async getUserByid(id: number): Promise<UserOnDb> {
    try {
      const response = await axios.get(`${API_URL}/user/${id}`);

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get user by id");
      }
    } catch (error) {
      console.error("Error fetching user by id:", error);
      throw error;
    }
  }
}

export default AuthRepository;
