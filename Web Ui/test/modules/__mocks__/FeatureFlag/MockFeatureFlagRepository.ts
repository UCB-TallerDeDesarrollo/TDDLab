import { FeatureFlag, FeatureFlagRepositoryInterface, FeatureFlagUpdateRequest } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

export class MockFeatureFlagRepository implements FeatureFlagRepositoryInterface {
  private featureFlags: FeatureFlag[] = [];

  constructor(initialFlags: FeatureFlag[] = []) {
    this.featureFlags = [...initialFlags];
  }

  getFlags = jest.fn(async () => {
    return this.featureFlags;
  });

  getFlagByName = jest.fn(async (name: string) => {
    return this.featureFlags.find(flag => flag.feature_name === name) || null;
  });

  updateFlag = jest.fn(async (id: number, request: FeatureFlagUpdateRequest) => {
    const flag = this.featureFlags.find(f => f.id === id);
    if (!flag) throw new Error("Flag not found");
    flag.is_enabled = request.is_enabled;
    return flag;
  });
}