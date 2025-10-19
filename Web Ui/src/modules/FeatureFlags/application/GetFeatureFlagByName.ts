import { FeatureFlag } from "../domain/FeatureFlag";
import FeatureFlagRepository from "../repository/FeatureFlagRepository";
import { FeatureFlagRepositoryInterface } from "../domain/FeatureFlag";

export class GetFeatureFlagByName {
  private readonly repo: FeatureFlagRepositoryInterface;

  constructor() {
    this.repo = new FeatureFlagRepository();
  }

  async execute(featureName: string): Promise<FeatureFlag | null> {
    return await this.repo.getFlagByName(featureName); // <-- directo al backend
  }
}

