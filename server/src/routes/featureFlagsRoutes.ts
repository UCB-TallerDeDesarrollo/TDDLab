import express from "express";
import FeatureFlagRepository from "../modules/FeatureFlags/repositories/FeatureFlagRepository";
import FeatureFlagsController from "../controllers/featureFlags/featureFlagsController";

const repository = new FeatureFlagRepository();
const featureFlagsController = new FeatureFlagsController(repository);
const featureFlagsRouter = express.Router();

// Crear un nuevo Feature Flag
featureFlagsRouter.post(
  "/",
  async (req, res) => await featureFlagsController.createFeatureFlag(req, res)
);

// Obtener todos los Feature Flags
featureFlagsRouter.get(
  "/",
  async (req, res) => await featureFlagsController.getFeatureFlags(req, res)
);

// Obtener un Feature Flag por ID
featureFlagsRouter.get(
  "/id/:id",
  async (req, res) => await featureFlagsController.getFeatureFlagById(req, res)
);

// Obtener un Feature Flag por nombre
featureFlagsRouter.get(
  "/name/:name",
  async (req, res) => await featureFlagsController.getFeatureFlagByName(req, res)
);

// Actualizar un Feature Flag por ID
featureFlagsRouter.put(
  "/:id",
  async (req, res) => await featureFlagsController.updateFeatureFlag(req, res)
);

// Eliminar un Feature Flag por ID
featureFlagsRouter.delete(
  "/:id",
  async (req, res) => await featureFlagsController.deleteFeatureFlag(req, res)
);

export default featureFlagsRouter;