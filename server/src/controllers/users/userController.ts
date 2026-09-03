import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";
import { registerUserWithGoogle } from "../../modules/Users/Application/registerUserWithGoogle";
import { loginUserWithGoogle } from "../../modules/Users/Application/loginUserWithGoogle";
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

class UserController {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  async registerUserController(req: Request, res: Response): Promise<void> {
    const { email, groupid, role } = req.body;

    if (!email || !groupid || !role) {
      res.status(400).json({
        error: "Debes proporcionar un email, grupo y rol validos",
      });
      return;
    }

    try {
      await registerUser({ email, groupid, role });
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

  async registerUserWithGoogleController(req: Request, res: Response): Promise<void> {
    const { idToken, groupid, role } = req.body;

    if (!idToken || !groupid || !role) {
      res.status(400).json({
        error: "Debes proporcionar un token, grupo y rol válidos",
      });
      return;
    }

    try {
      await registerUserWithGoogle(idToken, groupid, role);
      res.status(201).json({ message: "Usuario registrado con éxito usando Google." });
    } catch (error: any) {
      if (error.message === "UserAlreadyExistsInThatGroup") {
        res.status(409).json({ error: "The user is already registered in that group." });
      } else if (error.message === "No tiene permisos para registrar administradores") {
        res.status(403).json({ error: "No tiene permisos para registrar administradores" });
      } else if (error.message === "Token inválido o expirado" || 
                 error.message === "Token expirado" || 
                 error.message === "Token inválido") {
        res.status(401).json({ error: error.message });
      } else if (error.message === "No se pudo obtener email de Firebase") {
        res.status(400).json({ error: error.message });
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

  async getUserControllerGoogle(req: Request, res: Response): Promise<void> {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: "Debes proporcionar un token válido" });
      return;
    }

    try {
      const { user, jwtToken } = await loginUserWithGoogle(idToken);
      await saveUserCookie(jwtToken, res);
      res.status(200).json(user);
    } catch (error: any) {
      if (error.message === "DEBE_USAR_GOOGLE") {
        res.status(400).json({ 
          error: "Este usuario está registrado con Google. Por favor, inicia sesión con Google." 
        });
      } else if (error.message === "Usuario no encontrado") {
        res.status(404).json({ error: "Usuario no encontrado. Por favor, regístrate primero." });
      } else if (error.message === "Token inválido o expirado" ||
                 error.message === "Token expirado" ||
                 error.message === "Token inválido") {
        res.status(401).json({ error: error.message });
      } else if (error.message === "No se pudo obtener email de Firebase") {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error en el servidor" });
      }
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
        res.status(200).json(userData);
      }
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  }

  async getUserbyid(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({
        error: "Debes proporcionar un id valido:",
      });
      return;
    }

    try {
      const userData = await getUser(id);
      if (userData == null) {
        res.status(404).json({ message: "Usuario no encontrado" });
      } else {
        res.status(200).json(userData);
      }
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  }

  async getUsersController(req: Request, res: Response): Promise<void> {
    try {
      const users = await getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  }

  async getUsersByGroupid(req: Request, res: Response): Promise<void> {
    const groupid = Number(req.params.groupid);
    if (!groupid) {
      res.status(400).json({ error: "Debes proporcionar un groupid valido" });
      return;
    }

    try {
      const users = await getUsers();
      const filteredUsers = users.filter((user) => user.groupid === groupid);
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { email, role } = req.body;
    if (!email && !role) {
      res.status(400).json({ error: "Debes proporcionar al menos un campo para actualizar" });
      return;
    }

    try {
      const updatedUser = await updateUserById(Number(id), req.body);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error en el servidor" });
    }
  }

  async verifyPassword(req: Request, res: Response): Promise<void> {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: "Debes proporcionar una contraseña" });
      return;
    }

    try {
      const isValidPassword = await this.userRepository.verifyPassword(password);
      res.status(200).json({ valid: isValidPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error en el servidor" });
    }
  }

  async removeUserFromGroup(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: "Debes proporcionar un userId válido" });
      return;
    }

    try {
      await removeUser(Number(userId));
      res.status(200).json({ message: "Usuario removido del grupo con éxito." });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error en el servidor" });
    }
  }
}

export default UserController;
