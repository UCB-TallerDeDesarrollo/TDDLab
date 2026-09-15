import { FeatureFlagDataObject, FeatureFlagCreationObject, FeatureFlagUpdateObject } from "./FeatureFlag";

export interface IFeatureFlagRepository {
  checkDuplicateFeatureName(feature_name: string): Promise<boolean>;
  obtainFeatureFlags(): Promise<FeatureFlagDataObject[]>;
  obtainFeatureFlagById(id: number): Promise<FeatureFlagDataObject | null>;
  obtainFeatureFlagByName(feature_name: string): Promise<FeatureFlagDataObject | null>;
  createFeatureFlag(featureFlag: FeatureFlagCreationObject): Promise<FeatureFlagDataObject>;
  updateFeatureFlag(id: number, featureFlag: FeatureFlagUpdateObject): Promise<FeatureFlagDataObject | null>;
  deleteFeatureFlag(id: number): Promise<boolean>;
}
