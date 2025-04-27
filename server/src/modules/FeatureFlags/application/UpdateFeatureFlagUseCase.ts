import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagDataObject, FeatureFlagUpdateObject } from "../domain/FeatureFlag";

class UpdateFeatureFlag {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(id: number, featureFlag: FeatureFlagUpdateObject): Promise<FeatureFlagDataObject | null> {
    try {
      // Validar que el ID sea válido
      if (!id || id <= 0) {
        throw new Error("Invalid feature flag ID");
      }

      // Validar que haya al menos un campo para actualizar
      if (Object.keys(featureFlag).length === 0) {
        throw new Error("No fields provided for update");
      }

      // Validar que el nombre del feature no esté vacío si se proporciona
      if (featureFlag.feature_name !== undefined && featureFlag.feature_name.trim() === "") {
        throw new Error("Feature name cannot be empty");
      }

      const updatedFeatureFlag = await this.repository.updateFeatureFlag(id, featureFlag);
      return updatedFeatureFlag;
    } catch (error) {
      console.error(`Error updating feature flag with id ${id}.`, error);
      throw error;
    }
  }
}

export default UpdateFeatureFlag;