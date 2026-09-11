import { FeatureFlagDataObject } from "../domain/FeatureFlag";
import { IFeatureFlagRepository } from "../domain/IFeatureFlagRepository";

class GetFeatureFlagByName {
  private readonly repository: IFeatureFlagRepository;

  constructor(repository: IFeatureFlagRepository) {
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
      console.error("Error obtaining feature flag with name", error);
      throw error;
    }
  }
}

export default GetFeatureFlagByName;