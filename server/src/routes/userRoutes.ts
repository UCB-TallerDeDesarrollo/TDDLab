import express from "express";
import { UserRepository } from "../modules/Users/Repositories/UserRepository";
import UserController from "../controllers/users/userController";

const userRepository = new UserRepository();
const userController = new UserController(userRepository);

const router = express.Router();

router.post("/register", (req, res) => userController.registerUserController(req, res));
router.post("/login", (req, res) => userController.getUserController(req, res));
router.post("/verifyPassword", (req, res) => userController.verifyPassword(req, res));
router.get("/users", (req, res) => userController.getUsersController(req, res));
router.get("/groups/:id", (req, res) => userController.getUserGroupsController(req, res));
router.get("/users/groupid/:groupid", (req, res) => userController.getUsersByGroupid(req, res));
router.get("/users/:id", (req, res) => userController.getUserbyid(req, res));
router.put("/users/:id", (req, res) => userController.updateUser(req, res));
router.delete("/users/delete/:userId", (req, res) => userController.removeUserFromGroup(req, res));
export default router;