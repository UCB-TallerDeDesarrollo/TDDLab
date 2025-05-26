import FeatureFlagRepository from "../repositories/FeatureFlagRepository";
import { FeatureFlagsPlainObject } from "../domain/FeatureFlag";

class GetFeatureFlagsPlain {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(): Promise<FeatureFlagsPlainObject> {
    try {
      const featureFlags = await this.repository.obtainFeatureFlags();
      
      const plainObject: FeatureFlagsPlainObject = {};
      featureFlags.forEach(flag => {
        if (flag.feature_name.startsWith('extension_')) {
          const cleanName = flag.feature_name.replace('extension_', '');
          plainObject[cleanName] = flag.is_enabled;
        }
      });
      
      return plainObject;
    } catch (error) {
      console.error("Error obtaining feature flags in plain format.", error);
      throw error;
    }
  }
}

export default GetFeatureFlagsPlain;