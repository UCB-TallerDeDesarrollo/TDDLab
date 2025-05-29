import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagsForExtension } from "../domain/FeatureFlag";

class GetFeatureFlagsForExtension {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(): Promise<FeatureFlagsForExtension> {
    return this.repository.obtainFeatureFlagsForExtension();
  }
}

export default GetFeatureFlagsForExtension;