export interface FeatureFlagDataObject {
  id: number;
  feature_name: string;
  is_enabled: boolean;
}

export interface FeatureFlagCreationObject {
  feature_name: string;
  is_enabled: boolean;
}

export interface FeatureFlagUpdateObject {
  feature_name?: string;
  is_enabled?: boolean;
}