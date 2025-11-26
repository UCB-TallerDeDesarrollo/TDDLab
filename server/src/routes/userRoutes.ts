import express from "express";
import { UserRepository } from "../modules/Users/Repositories/UserRepository";
import UserController from "../controllers/users/userController";
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";

const userRepository = new UserRepository();
const userController = new UserController(userRepository);

const router = express.Router();

router.post("/register", (req, res) =>
  userController.registerUserController(req, res)
);
router.post("/register/google", (req, res) =>
  userController.registerUserWithGoogleController(req, res)
);
router.post("/login", (req, res) => userController.getUserController(req, res));
router.post("/github", (req, res) =>
  userController.getUserControllerGithub(req, res)
);
router.post("/google", (req, res) =>
  userController.getUserControllerGoogle(req, res)
);
router.post(
  "/verifyPassword",
  (req, res) => userController.verifyPassword(req, res)
);
router.get(
  "/users",
  authenticateJWT,
  authorizeRoles("admin", "teacher"),
  (req, res) => userController.getUsersController(req, res)
);
router.get(
  "/me",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  (req, res) => userController.getMeController(req, res)
);
router.get(
  "/groups/:id",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  (req, res) => userController.getUserGroupsController(req, res)
);
router.get(
  "/users/groupid/:groupid",
  authenticateJWT,
  authorizeRoles("admin", "teacher", "student"),
  (req, res) => userController.getUsersByGroupid(req, res)
);
router.get(
  "/users/:id",
  authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  (req, res) => userController.getUserbyid(req, res)
);
router.put(
  "/users/:id",
  authenticateJWT,
  authorizeRoles("admin", "teacher"),
  (req, res) => userController.updateUser(req, res)
);
router.delete(
  "/users/delete/:userId",
  authenticateJWT,
  authorizeRoles("admin", "teacher"),
  (req, res) => userController.removeUserFromGroup(req, res)
);
router.post("/logout", authenticateJWT,   (_req, res) => userController.logoutController(res));
export default router;
