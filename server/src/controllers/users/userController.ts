import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";
import { getUser } from "../../modules/Users/Application/getUser";
import { getUsers } from "../../modules/Users/Application/getUsers";
import { UserRepository } from "../../modules/Users/Repositories/UserRepository";
import { getUserByemail } from "../../modules/Users/Application/getUserByemailUseCase";
import { getUserToken } from "../../modules/Users/Application/getUserToken";
import { saveUserCookie } from "../../modules/Users/Application/saveUserCookie";
import { decodeUserTokenFromCookie } from "../../modules/Users/Application/decodeUserTokenFromCookie";
import { updateUserById } from "../../modules/Users/Application/updateUser";
import { removeUser } from "../../modules/Users/Application/removeUserFromGroup";
import { User } from "../../modules/Users/Domain/User";
import admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

class UserController {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  async registerUserController(req: Request, res: Response): Promise<void> {
    const { email, groupid, role, firstName, lastName } = req.body;

    if (!email || !groupid || !role || !firstName || !lastName) {
      res.status(400).json({
        error: "Debes proporcionar un email, grupo, rol, nombre y apellido válidos",
      });
      return;
    }

    try {
        await registerUser({ email, groupid, role, firstName, lastName });
        res.status(201).json({ message: "Usuario registrado con éxito." });
      } catch (error: any) {
      if (error.message === "UserAlreadyExistsInThatGroup") {
        res
          .status(409)
          .json({ error: "The user is already registered in that group." });
      } else if (error.message === "No tiene permisos para registrar administradores") {
        res
          .status(403)
          .json({ error: "No tiene permisos para registrar administradores" });
      } else {
        res.status(500).json({ error: "Server error while registering user" });
      }
    }
  }


  async getUserController(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: "Debes proporcionar un email valido:",
      });
      return;
    }

    try {
      let userData = await getUserByemail(email);
      if (userData == null)
        res.status(404).json({ message: "Usuario no encontrado" });
      else res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching user" });
    }
  }

  async getUserControllerGithub(req: Request, res: Response): Promise<void> {
    const { idToken } = req.body;
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const email = decoded.email;
      if (!email) {
        res.status(400).json({ error: "No se pudo obtener email de Firebase" });
        return;
      }
      let user = (await getUserByemail(email || "")) as User;
      const token = await getUserToken(user);
      await saveUserCookie(token, res);
      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ error: "Token inválido o expirado" });
    }
  }


async  logoutController (res: Response): Promise<void> {
  res.clearCookie("userSession", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Sesión cerrada correctamente" });
};

  async getMeController(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.userSession;
      if (!token) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }
      const decoded = decodeUserTokenFromCookie(token);
      const userData = await getUser(decoded.id);
      if (!userData) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(200).json(userData);
    } catch (error) {
      console.error("Error en /me:", error);
      res.status(401).json({ error: "Token inválido o expirado" });
    }
  }

  async getUserGroupsController(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    if (!id) {
      res.status(400).json({
        error: "Debes proporcionar un id valido:",
      });
      return;
    }

    try {
      let userData = await getUser(id);

      if (userData == null) {
        res.status(404).json({ message: "Usuario no encontrado" });
      } else if ("email" in userData) {
        let userGroups = await getUserByemail(userData.email);
        if (userGroups != null && "groupid" in userGroups) {
          res.status(200).json(userGroups.groupid);
        } else {
          res.status(404).json({ message: "Usuario no encontrado" });
        }
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching user" });
    }
  }

  async verifyPassword(req: Request, res: Response): Promise<void> {
    try {
      const { password } = req.body;
      if (password === "TDDLabContraTemporal") {
        res
          .status(200)
          .json({ success: true, message: "Password is correct." });
      } else {
        res.status(401).json({ success: false, message: "Wrong password." });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
  async getUsersByGroupid(req: Request, res: Response): Promise<void> {
    const { groupid } = req.params;
    const gid = parseInt(groupid);

    if (Number.isNaN(gid)) {
      res.status(400).json({ error: "Debes proporcionar un groupid válido" });
    return;
    }

    try {
      const users = await this.userRepository.getUsersByGroupid(gid)
      res.json(users);
    } catch (error) {
      res
        .status(404)
        .json({ error: "No se encontraron usuarios con ese grupo" });
    }
  }
  async getUsersController(_req: Request, res: Response): Promise<void> {
    try {
      let userData = await getUsers();
      if (userData == null)
        res.status(404).json({ message: "Usuarios no encontrado" });
      else res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching users" });
    }
  }

  async getUserbyid(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    if (!id) {
      res.status(400).json({
        error: "Debes proporcionar un id valido:",
      });
      return;
    }

    try {
      let userData = await getUser(id);
      if (userData == null)
        res.status(404).json({ message: "Usuario no encontrado" });
      else res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching user" });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const { groupid } = req.body;
    if (!id) {
      res.status(400).json({
        error: "Debes proporcionar un id de usuario valido:",
      });
      return;
    }
    try {
      const userData = await updateUserById(id, groupid);
      if (userData == null)
        res.status(404).json({ message: "Usuario no encontrado" });
      else res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateUserById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number(req.params.id);
      const userFromToken = (req as any).user; 
      
     
      if (userFromToken.role === 'student' && userFromToken.id !== userId) {
        return res.status(403).json({ 
          message: "Los estudiantes solo pueden actualizar su propio perfil" 
        });
      }

      const { firstName, lastName } = req.body;
      
      const updatedUser = await this.userRepository.updateUserById(userId,  firstName, lastName );

      
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async updateUserRoleById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;
      const userFromToken = (req as any).user; 

      if (!userId || !role) {
        return res.status(400).json({ error: "Debes proporcionar un id y un rol válidos" });
      }

      if (userFromToken.id === userId) {
        return res.status(403).json({ error: "No puedes cambiar tu propio rol" });
      }

      if (!["admin", "teacher"].includes(userFromToken.role)) {
        return res.status(403).json({ error: "No tienes permisos para cambiar roles" });
      }

      const validRoles = ["admin", "teacher", "student"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Rol no válido" });
      }

      const updatedUser = await this.userRepository.updateUserRole(userId, role);

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      return res.status(200).json({
        message: `Rol del usuario con ID ${userId} actualizado a '${role}' exitosamente`,
        user: updatedUser,
      });

    } catch (error) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  
  async removeUserFromGroup(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);

    if (!userId) {
      res.status(400).json({
        error: "Debes proporcionar un id de usuario valido:",
      });
      return;
    }
    try {
      console.log(userId);
      await removeUser(userId);
      res
        .status(200)
        .json({ message: "Usuario eliminado del grupo exitosamente." });
    } catch (error:any) {
      console.error("Error al eliminar usuario del grupo:", error);
      const msg = typeof error === "string" ? error : error?.message;
      if (msg === "Usuario o grupo no encontrado") {
        res.status(404).json({ error: msg });
      } else {
        res.status(500).json({ error: "Error interno del servidor." });
        }
    }
  }
}
export default UserController;