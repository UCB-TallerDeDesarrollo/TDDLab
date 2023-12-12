import express from "express";
import {
  getUserController,
  getUsersController,
  registerUserController,
  verifyPassword,
} from "../controllers/users/userController";

const router = express.Router();

// Ruta de registro de usuario
router.post("/register", registerUserController);
router.post("/login", async (req, res) => await getUserController(req, res));
router.post(
  "/verifyPassword",
  async (req, res) => await verifyPassword(req, res)
);

router.get(
  "/users",
  async (req,res) => await getUsersController(req,res)
);

export default router;
