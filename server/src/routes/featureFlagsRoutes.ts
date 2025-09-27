import express from "express";
import FeatureFlagRepository from "../modules/FeatureFlags/repositories/FeatureFlagRepository";
import FeatureFlagsController from "../controllers/featureFlags/featureFlagsController";
import {
  authenticateJWT,
  authorizeRoles,
} from "../../src/middleware/authMiddleware";
const repository = new FeatureFlagRepository();
const featureFlagsController = new FeatureFlagsController(repository);
const featureFlagsRouter = express.Router();

// Crear un nuevo Feature Flag
featureFlagsRouter.post(
  "/",
    authenticateJWT,
    authorizeRoles("admin", "teacher"),
  async (req, res) => await featureFlagsController.createFeatureFlag(req, res)
);

// Obtener todos los Feature Flags
featureFlagsRouter.get(
  "/",
    authenticateJWT,
    authorizeRoles("admin", "teacher"),
  async (req, res) => await featureFlagsController.getFeatureFlags(req, res)
);

// Obtener un Feature Flag por ID
featureFlagsRouter.get(
  "/id/:id",
    authenticateJWT,
    authorizeRoles("admin", "teacher"),
  async (req, res) => await featureFlagsController.getFeatureFlagById(req, res)
);

// Obtener un Feature Flag por nombre
featureFlagsRouter.get(
  "/name/:name",
    authenticateJWT,
    authorizeRoles("admin", "teacher"),
  async (req, res) => await featureFlagsController.getFeatureFlagByName(req, res)
);

// Actualizar un Feature Flag por ID
featureFlagsRouter.put(
  "/:id",
    authenticateJWT,
    authorizeRoles("admin", "teacher"),
  async (req, res) => await featureFlagsController.updateFeatureFlag(req, res)
);

// Eliminar un Feature Flag por ID
featureFlagsRouter.delete(
  "/:id",
    authenticateJWT,
    authorizeRoles("admin", "teacher"),
  async (req, res) => await featureFlagsController.deleteFeatureFlag(req, res)
);

export default featureFlagsRouter;