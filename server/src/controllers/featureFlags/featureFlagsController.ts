import { Request, Response } from "express";
import CreateFeatureFlag from "../../modules/FeatureFlags/application/CreateFeatureFlagUseCase";
import DeleteFeatureFlag from "../../modules/FeatureFlags/application/DeleteFeatureFlagUseCase";
import GetFeatureFlags from "../../modules/FeatureFlags/application/GetFeatureFlagsUseCase";
import GetFeatureFlagById from "../../modules/FeatureFlags/application/GetFeatureFlagByIdUseCase";
import GetFeatureFlagByName from "../../modules/FeatureFlags/application/GetFeatureFlagByNameUseCase";
import UpdateFeatureFlag from "../../modules/FeatureFlags/application/UpdateFeatureFlagUseCase";
import FeatureFlagRepository from "../../modules/FeatureFlags/repositories/FeatureFlagRepository";

class FeatureFlagsController {
  private readonly createFeatureFlagUseCase: CreateFeatureFlag;
  private readonly deleteFeatureFlagUseCase: DeleteFeatureFlag;
  private readonly updateFeatureFlagUseCase: UpdateFeatureFlag;
  private readonly getFeatureFlagsUseCase: GetFeatureFlags;
  private readonly getFeatureFlagByIdUseCase: GetFeatureFlagById;
  private readonly getFeatureFlagByNameUseCase: GetFeatureFlagByName;

  constructor(repository: FeatureFlagRepository) {
    this.createFeatureFlagUseCase = new CreateFeatureFlag(repository);
    this.deleteFeatureFlagUseCase = new DeleteFeatureFlag(repository);
    this.getFeatureFlagByIdUseCase = new GetFeatureFlagById(repository);
    this.getFeatureFlagByNameUseCase = new GetFeatureFlagByName(repository);
    this.getFeatureFlagsUseCase = new GetFeatureFlags(repository);
    this.updateFeatureFlagUseCase = new UpdateFeatureFlag(repository);
  }

  async getFeatureFlags(_req: Request, res: Response): Promise<void> {
    try {
      const featureFlags = await this.getFeatureFlagsUseCase.execute();
      res.status(200).json(featureFlags);
    } catch (error) {
      res.status(500).json({ error: "Error del servidor" });
    }
  }

  async getFeatureFlagById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      
      const featureFlag = await this.getFeatureFlagByIdUseCase.execute(id);
      if (!featureFlag) {
        res.status(404).json({ error: "Feature flag no encontrado" });
        return;
      }
      
      res.status(200).json(featureFlag);
    } catch (error) {
      res.status(500).json({ error: "Error del servidor" });
    }
  }

  async getFeatureFlagByName(req: Request, res: Response): Promise<void> {
    try {
      const name = req.params.name;
      if (!name) {
        res.status(400).json({ error: "Nombre no proporcionado" });
        return;
      }
      
      const featureFlag = await this.getFeatureFlagByNameUseCase.execute(name);
      if (!featureFlag) {
        res.status(404).json({ error: "Feature flag no encontrado" });
        return;
      }
      
      res.status(200).json(featureFlag);
    } catch (error) {
      res.status(500).json({ error: "Error del servidor" });
    }
  }

  async createFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const { feature_name, is_enabled } = req.body;
      
      if (!feature_name) {
        res.status(400).json({ error: "Nombre del feature es requerido" });
        return;
      }
      
      const newFeatureFlag = await this.createFeatureFlagUseCase.execute({
        feature_name,
        is_enabled: is_enabled !== undefined ? is_enabled : false
      });
      
      res.status(201).json(newFeatureFlag);
    } catch (error) {
      if (error instanceof Error && error.message.includes("cannot be empty")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error del servidor" });
      }
    }
  }

  async deleteFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      
      await this.deleteFeatureFlagUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ error: "Feature flag no encontrado" });
      } else {
        res.status(500).json({ error: "Error del servidor" });
      }
    }
  }

  async updateFeatureFlag(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      
      const { feature_name, is_enabled } = req.body;
      const updateData: { feature_name?: string; is_enabled?: boolean } = {};
      
      if (feature_name !== undefined) updateData.feature_name = feature_name;
      if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
      
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: "No se proporcionaron datos para actualizar" });
        return;
      }
      
      const updatedFeatureFlag = await this.updateFeatureFlagUseCase.execute(id, updateData);
      
      if (!updatedFeatureFlag) {
        res.status(404).json({ error: "Feature flag no encontrado" });
        return;
      }
      
      res.status(200).json(updatedFeatureFlag);
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes("Invalid feature flag ID") || 
           error.message.includes("No fields provided") || 
           error.message.includes("cannot be empty"))) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error del servidor" });
      }
    }
  }
}

export default FeatureFlagsController;