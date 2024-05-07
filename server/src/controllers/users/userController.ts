import { Request, Response } from "express";
import { registerUser } from "../../modules/Users/Application/registerUser";
import { getUser } from "../../modules/Users/Application/getUser";
import { getUsers } from "../../modules/Users/Application/getUsers";
import { UserRepository } from "../../modules/Users/Repositories/UserRepository";

class UserController{
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  async registerUserController(req: Request, res: Response): Promise<void> {
    const { id,email, groupid, role } = req.body;

    if (!email || !groupid || !role) {
      res.status(400).json({
        error: "Debes proporcionar un correo, curso y rol validos",
      });
      return;
    }

    try {
      await registerUser({ id,email, groupid, role });
      res.status(201).json({ message: "Usuario registrado con éxito." });
    } catch (error) {
      res.status(500).json({ error: "Server error while registering user" });
    }
  }
  async getUserController(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: "Debes proporcionar un correo valido",
      });
      return;
    }

    try {
      let userData = await getUser(email);
      if (userData == null)
        res.status(404).json({ message: "Usuario no encontrado" });
      else 
        res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching user" });
    }
  }
  async verifyPassword(req: Request, res: Response): Promise<void> {
    try {
      const { password } = req.body;
      if (password === "TDDLabContraTemporal") {
        res.status(200).json({ success: true, message: "Password is correct." });
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
      const users = await this.userRepository.getUsersByGroupid(parseInt(groupid));
      res.json(users);
    } catch (error) {
      res.status(404).json({ error: "No se encontraron usuarios con ese grupo" });
    }
  }
  async getUsersController(_req: Request, res: Response): Promise<void> {
    try {
      let userData = await getUsers();
      if (userData == null)
        res.status(404).json({ message: "Usuarios no encontrado" });
      else 
        res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching users" });
    }
  }

}
export default UserController



