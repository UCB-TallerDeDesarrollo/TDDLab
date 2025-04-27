import { FeatureFlagDataObject } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

export const featureFlagEnabledMock: FeatureFlagDataObject = {
  id: 1,
  feature_name: "feature_enabled",
  is_enabled: true,
};

export const featureFlagDisabledMock: FeatureFlagDataObject = {
  id: 2,
  feature_name: "feature_disabled",
  is_enabled: false,
};

export function getFeatureFlagListMock(): FeatureFlagDataObject[] {
  return [
    {
      id: 1,
      feature_name: "feature_one",
      is_enabled: true,
    },
    {
      id: 2,
      feature_name: "feature_two",
      is_enabled: false,
    },
    {
      id: 3,
      feature_name: "feature_three",
      is_enabled: true,
    },
  ];
}