import { FeatureFlagDataObject } from "../domain/FeatureFlag";
import { IFeatureFlagRepository } from "../domain/IFeatureFlagRepository";

class GetFeatureFlagById {
  private readonly repository: IFeatureFlagRepository;

  constructor(repository: IFeatureFlagRepository) {
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