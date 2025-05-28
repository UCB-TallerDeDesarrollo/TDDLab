import UpdateFeatureFlag from "../../../../src/modules/FeatureFlags/application/UpdateFeatureFlagUseCase";
import { getFeatureFlagRepositoryMock } from "../../../__mocks__/featuresFlags/repositoryMock";
import { FeatureFlagUpdateObject } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();
let updateFeatureFlag: UpdateFeatureFlag;

beforeEach(() => {
  updateFeatureFlag = new UpdateFeatureFlag(featureFlagRepositoryMock);
  jest.clearAllMocks();
});

describe("Update feature flag", () => {
  it("should update a feature flag successfully", async () => {
    const updateData: FeatureFlagUpdateObject = {
      feature_name: "updated_feature",
      is_enabled: false
    };
    const updatedFeatureFlag = {
      id: 1,
      feature_name: "updated_feature",
      is_enabled: false
    };
    featureFlagRepositoryMock.updateFeatureFlag.mockResolvedValueOnce(updatedFeatureFlag);

    const result = await updateFeatureFlag.execute(1, updateData);
    
    expect(result).toEqual(updatedFeatureFlag);
    expect(featureFlagRepositoryMock.updateFeatureFlag).toHaveBeenCalledWith(1, updateData);
  });

  it("should return null if feature flag does not exist", async () => {
    const updateData: FeatureFlagUpdateObject = {
      is_enabled: false
    };
    featureFlagRepositoryMock.updateFeatureFlag.mockResolvedValueOnce(null);

    const result = await updateFeatureFlag.execute(999, updateData);
    
    expect(result).toBeNull();
    expect(featureFlagRepositoryMock.updateFeatureFlag).toHaveBeenCalledWith(999, updateData);
  });

  it("should throw an error when feature flag ID is invalid", async () => {
    const updateData: FeatureFlagUpdateObject = {
      is_enabled: false
    };

    await expect(updateFeatureFlag.execute(0, updateData)).rejects.toThrow("Invalid feature flag ID");
    expect(featureFlagRepositoryMock.updateFeatureFlag).not.toHaveBeenCalled();
  });

  it("should throw an error when no fields are provided for update", async () => {
    const emptyUpdateData: FeatureFlagUpdateObject = {};

    await expect(updateFeatureFlag.execute(1, emptyUpdateData)).rejects.toThrow("No fields provided for update");
    expect(featureFlagRepositoryMock.updateFeatureFlag).not.toHaveBeenCalled();
  });

  it("should throw an error when feature name is empty", async () => {
    const invalidUpdateData: FeatureFlagUpdateObject = {
      feature_name: ""
    };

    await expect(updateFeatureFlag.execute(1, invalidUpdateData)).rejects.toThrow("Feature name cannot be empty");
    expect(featureFlagRepositoryMock.updateFeatureFlag).not.toHaveBeenCalled();
  });

  it("should handle errors when updating a feature flag", async () => {
    const updateData: FeatureFlagUpdateObject = {
      is_enabled: false
    };
    featureFlagRepositoryMock.updateFeatureFlag.mockRejectedValue(new Error("Database error"));

    await expect(updateFeatureFlag.execute(1, updateData)).rejects.toThrow();
  });
});