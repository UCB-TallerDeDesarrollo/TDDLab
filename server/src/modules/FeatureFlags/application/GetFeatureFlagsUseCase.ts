import { FeatureFlagDataObject } from "../domain/FeatureFlag";
import { IFeatureFlagRepository } from "../domain/IFeatureFlagRepository";

class GetFeatureFlags {
  private readonly repository: IFeatureFlagRepository;

  constructor(repository: IFeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(): Promise<FeatureFlagDataObject[]> {
    try {
      const featureFlags = await this.repository.obtainFeatureFlags();
      return featureFlags;
    } catch (error) {
      console.error("Error obtaining feature flags.", error);
      throw error;
    }
  }
}

export default GetFeatureFlags;