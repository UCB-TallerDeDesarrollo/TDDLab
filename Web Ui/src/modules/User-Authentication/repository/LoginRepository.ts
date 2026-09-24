import axios from "axios";
import { VITE_API } from "../../../../config";
import { RegisterAccountDTO } from "../domain/dto/RegisterAccountDto";
import { AuthDBRepositoryInterface } from "../domain/LoginRepositoryInterface";
import { OAuthProvider } from "../domain/AuthManager";
import { UserOnDb } from "../domain/userOnDb.interface";

const API_URL = VITE_API;

export class AuthRepository implements AuthDBRepositoryInterface {
  private readonly providerEndpoints: Record<OAuthProvider, string> = {
    [OAuthProvider.Google]: "/user/google",
    [OAuthProvider.GitHub]: "/user/github",
  };

  private readonly registerEndpoints: Record<OAuthProvider, string> = {
    [OAuthProvider.Google]: "/user/register/google",
    [OAuthProvider.GitHub]: "/user/register/github",
  };

  async getAccountInfoWithToken(
    idToken: string,
    provider: OAuthProvider
  ): Promise<UserOnDb> {
    const endpoint = this.providerEndpoints[provider] || "/user/google";
    try {
      const response = await axios.post(
        `${API_URL}${endpoint}`,
        { idToken },
        { withCredentials: true }
      );

      const data = response.data;
      return {
        id: data.id ?? data.userid,
        email: data.email ?? data.userEmail,
        groupid: data.groupid ?? data.usergroupid,
        role: data.role ?? data.userRole,
      };
    } catch (error: unknown) {
      this.handleAxiosError(error, "Error al obtener información del usuario");
    }
  }

  async getAccountInfoByEmail(email: string): Promise<UserOnDb> {
    try {
      const response = await axios.post(
        `${API_URL}/user/login`,
        { email },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: unknown) {
      this.handleAxiosError(error, "Error al obtener la cuenta por email");
    }
  }

  async registerAccountWithToken(
    dto: RegisterAccountDTO,
    provider: OAuthProvider
  ): Promise<UserOnDb> {
    const endpoint = this.registerEndpoints[provider] || "/user/register/google";
    try {
      const response = await axios.post(
        `${API_URL}${endpoint}`,
        {
          idToken: dto.idToken,
          groupid: dto.groupid,
          role: dto.role,
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: unknown) {
      this.handleAxiosError(error, "Error al registrar usuario");
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_URL}/user/verifyPassword`,
        { password },
        { withCredentials: true }
      );
      return response.data.success;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Contraseña incorrecta. Por favor ingresa una contraseña válida.");
      }
      this.handleAxiosError(error, "Error al verificar contraseña");
    }
  }

  async getUserById(id: number): Promise<UserOnDb> {
    try {
      const response = await axios.get(`${API_URL}/user/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: unknown) {
      this.handleAxiosError(error, "Error al obtener usuario por ID");
    }
  }

  private handleAxiosError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error || error.response.data?.message || defaultMessage
      );
    }
    throw new Error(defaultMessage);
  }
}

export default AuthRepository;
