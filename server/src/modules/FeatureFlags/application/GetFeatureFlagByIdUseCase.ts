import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagDataObject } from "../domain/FeatureFlag";

class GetFeatureFlagById {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(id: number): Promise<FeatureFlagDataObject | null> {
    try {
      const featureFlag = await this.repository.obtainFeatureFlagById(id);
      return featureFlag;
    } catch (error) {
      console.error(`Error obtaining feature flag with id ${id}.`, error);
      throw error;
    }
  }
}

export default GetFeatureFlagById;