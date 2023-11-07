import express from "express";
import {
  getUserController,
  registerUserController,
} from "../controllers/users/userController";

const router = express.Router();

// Ruta de registro de usuario
router.post("/register", registerUserController);
router.post("/login", async (req, res) => await getUserController(req, res));
export default router;
