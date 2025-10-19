import { featureFlagEnabledMock, featureFlagDisabledMock } from "./dataTypeMocks/featureFlagData";

export function getFeatureFlagRepositoryMock() {
  return {
    executeQuery: jest.fn(),
    mapRowToFeatureFlag: jest.fn(),
    checkDuplicateFeatureName: jest.fn().mockReturnValue(false),
    obtainFeatureFlags: jest.fn(),
    obtainFeatureFlagById: jest.fn(async (id) => {
      switch (id) {
        case 1:
          return featureFlagEnabledMock;
        case 2:
          return featureFlagDisabledMock;
        default:
          return null;
      }
    }),
    obtainFeatureFlagByName: jest.fn(async (name) => {
      switch (name) {
        case "feature_enabled":
          return featureFlagEnabledMock;
        case "feature_disabled":
          return featureFlagDisabledMock;
        default:
          return null;
      }
    }),
    createFeatureFlag: jest.fn(),
    updateFeatureFlag: jest.fn(),
    deleteFeatureFlag: jest.fn(async (id) => {
      return id === 1 || id === 2;
    }),
    obtainFeatureFlagsForExtension: jest.fn(),

  };
}