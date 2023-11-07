import express from "express";
import { registerUserController } from "../controllers/users/userController";

const router = express.Router();

// Ruta de registro de usuario
router.post("/register", registerUserController);
export default router;
