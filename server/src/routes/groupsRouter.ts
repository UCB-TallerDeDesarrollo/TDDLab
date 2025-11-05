import express from "express";
import GroupsController from "../controllers/Groups/groupController";
import GroupRepository from "../modules/Groups/repositories/GroupRepository";
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";
const repository = new GroupRepository(); // Create an instance of your group repository
const groupController = new GroupsController(repository); // Pass the repository instance to the group controller

const groupsRouter = express.Router();

// Create a new group
groupsRouter.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await groupController.createGroup(req, res)
);

// Retrieve all groups
groupsRouter.get(
  "/",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await groupController.getGroups(req, res)
);

// Retrieve a specific group by ID
groupsRouter.get(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher","student"),
  async (req, res) => await groupController.getGroupById(req, res)
);

// Update a group by ID
groupsRouter.put(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await groupController.updateGroup(req, res)
);

// Delete a group by ID
groupsRouter.delete(
  "/:id",
    authenticateJWT,
  authorizeRoles("admin", "teacher"),
  async (req, res) => await groupController.deleteGroup(req, res)
);
export default groupsRouter;
