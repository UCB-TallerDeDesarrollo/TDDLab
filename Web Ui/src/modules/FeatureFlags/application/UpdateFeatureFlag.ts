import {
    FeatureFlag,
    FeatureFlagRepositoryInterface,
    FeatureFlagUpdateRequest
  } from "../domain/FeatureFlag";
  import FeatureFlagRepository from "../repository/FeatureFlagRepository";
  
  export class UpdateFeatureFlag {
    private readonly repo: FeatureFlagRepositoryInterface;
  
    constructor() {
      this.repo = new FeatureFlagRepository();
    }
  
    async execute(id: number, newValue: boolean): Promise<FeatureFlag> {
      const request: FeatureFlagUpdateRequest = {
        is_enabled: newValue
      };
      return await this.repo.updateFlag(id, request);
    }
  }