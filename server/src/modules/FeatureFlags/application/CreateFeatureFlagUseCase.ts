import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagCreationObject, FeatureFlagDataObject } from "../domain/FeatureFlag";

class CreateFeatureFlag {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(featureFlag: FeatureFlagCreationObject): Promise<FeatureFlagDataObject> {
    try {
      // Validar que el nombre del feature no esté vacío
      if (!featureFlag.feature_name || featureFlag.feature_name.trim() === "") {
        throw new Error("Feature name cannot be empty");
      }

      const newFeatureFlag = await this.repository.createFeatureFlag(featureFlag);
      return newFeatureFlag;
    } catch (error) {
      console.error("Feature Flag Creation Unsuccessful.", error);
      throw error;
    }
  }
}

export default CreateFeatureFlag;