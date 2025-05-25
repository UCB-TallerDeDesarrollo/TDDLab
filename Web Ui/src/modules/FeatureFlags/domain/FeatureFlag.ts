export type FeatureFlag = {
    id: number;
    feature_name: string;
    is_enabled: boolean;
  };
  
  export type FeatureFlagUpdateRequest = {
    is_enabled: boolean;
  };
  
  export interface FeatureFlagRepositoryInterface {
    getFlags(): Promise<FeatureFlag[]>;
    updateFlag(id: number, request: FeatureFlagUpdateRequest): Promise<FeatureFlag>;
    getFlagByName(name: string): Promise<FeatureFlag | null>;
  }