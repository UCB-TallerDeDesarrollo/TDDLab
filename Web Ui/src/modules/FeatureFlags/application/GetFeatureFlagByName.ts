import { FeatureFlag } from "../domain/FeatureFlag";
import FeatureFlagRepository from "../repository/FeatureFlagRepository";
import { FeatureFlagRepositoryInterface } from "../domain/FeatureFlag";

export class GetFeatureFlagByName {
  private readonly repo: FeatureFlagRepositoryInterface;

  constructor() {
    this.repo = new FeatureFlagRepository();
  }

  async execute(featureName: string): Promise<FeatureFlag | null> {
    const allFlags = await this.repo.getFlags();
    return allFlags.find(flag => flag.feature_name === featureName) || null;
  }
}

