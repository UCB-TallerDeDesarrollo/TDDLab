import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";
import { getUser } from "../../modules/Users/Application/getUser";
import { getUsers } from "../../modules/Users/Application/getUsers";
import { UserRepository } from "../../modules/Users/Repositories/UserRepository";
import { getUserByemail } from "../../modules/Users/Application/getUserByemailUseCase";
import { updateUserById } from "../../modules/Users/Application/updateUser";
import { removeUser } from "../../modules/Users/Application/removeUserFromGroup";

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
      if(error.message === "UserAlreadyExistsInThatGroup"){
        res.status(409).json({error: "The user is already registered in that group."});
      }
      else{
        res.status(500).json({ error: "Server error while registering user" });
      }
    }
  }
  async getUserController(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: "Debes proporcionar un id valido:",
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

      if (userData == null)
        res.status(404).json({ message: "Usuario no encontrado" });
      else if ("email" in userData) {
            let userGroups = await getUserByemail(userData.email);
            if (userGroups != null && "groupid" in userGroups) {
              res.status(200).json(userGroups.groupid);
            }
          }
          else{
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

    try {
      const users = await this.userRepository.getUsersByGroupid(
        parseInt(groupid)
      );
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

  async removeUserFromGroup(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);

    if (!userId) {
        res.status(400).json({
          error: "Debes proporcionar un id de usuario valido:",
        });
        return;
      }
    try {
      console.log(userId)
      await removeUser(userId);
      res.status(200).json({ message: "Usuario eliminado del grupo exitosamente." });
    } catch (error) {
      console.error("Error al eliminar usuario del grupo:", error);
      if (error === "Usuario o grupo no encontrado") {
        res.status(404).json({ error: error });
      } else {
        res.status(500).json({ error: "Error interno del servidor." });
      }
    }
  }
}
export default UserController;
