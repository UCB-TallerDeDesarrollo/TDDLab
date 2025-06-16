import CreateFeatureFlag from "../../../../src/modules/FeatureFlags/application/CreateFeatureFlagUseCase";
import { getFeatureFlagRepositoryMock } from "../../../__mocks__/featuresFlags/repositoryMock";
import { FeatureFlagCreationObject } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();
let createFeatureFlag: CreateFeatureFlag;

beforeEach(() => {
  createFeatureFlag = new CreateFeatureFlag(featureFlagRepositoryMock);
  jest.clearAllMocks();
});

describe("Create feature flag", () => {
  it("should create a feature flag successfully", async () => {
    const newFeatureFlag: FeatureFlagCreationObject = {
      feature_name: "new_feature",
      is_enabled: true
    };
    featureFlagRepositoryMock.createFeatureFlag.mockResolvedValueOnce({
      id: 3,
      ...newFeatureFlag
    });

    const result = await createFeatureFlag.execute(newFeatureFlag);
    
    expect(result).toEqual({
      id: 3,
      ...newFeatureFlag
    });
    expect(featureFlagRepositoryMock.createFeatureFlag).toHaveBeenCalledWith(newFeatureFlag);
  });

  it("should throw an error when feature name is empty", async () => {
    const invalidFeatureFlag: FeatureFlagCreationObject = {
      feature_name: "",
      is_enabled: true
    };

    await expect(createFeatureFlag.execute(invalidFeatureFlag)).rejects.toThrow("Feature name cannot be empty");
    expect(featureFlagRepositoryMock.createFeatureFlag).not.toHaveBeenCalled();
  });

  it("should handle errors when creating a feature flag", async () => {
    const newFeatureFlag: FeatureFlagCreationObject = {
      feature_name: "new_feature",
      is_enabled: true
    };
    featureFlagRepositoryMock.createFeatureFlag.mockRejectedValue(new Error("Database error"));

    await expect(createFeatureFlag.execute(newFeatureFlag)).rejects.toThrow();
  });
});