import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagDataObject } from "../domain/FeatureFlag";

class GetFeatureFlags {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
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