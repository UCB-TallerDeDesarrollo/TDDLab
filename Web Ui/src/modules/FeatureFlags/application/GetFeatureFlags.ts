import { FeatureFlag } from "../domain/FeatureFlag";
import FeatureFlagRepository from "../repository/FeatureFlagRepository";
import { FeatureFlagRepositoryInterface } from "../domain/FeatureFlag";

export class GetFeatureFlags {
  private readonly repo: FeatureFlagRepositoryInterface;

  constructor() {
    this.repo = new FeatureFlagRepository();
  }

  async execute(): Promise<FeatureFlag[]> {
    return await this.repo.getFlags();
  }
}