import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagDataObject } from "../domain/FeatureFlag";

class GetFeatureFlagByName {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(feature_name: string): Promise<FeatureFlagDataObject | null> {
    try {
      if (!feature_name || feature_name.trim() === "") {
        throw new Error("Feature name cannot be empty");
      }
      
      const featureFlag = await this.repository.obtainFeatureFlagByName(feature_name);
      return featureFlag;
    } catch (error) {
      console.error(`Error obtaining feature flag with name ${feature_name}.`, error);
      throw error;
    }
  }
}

export default GetFeatureFlagByName;