import GetFeatureFlagByName from "../../../../src/modules/FeatureFlags/application/GetFeatureFlagByNameUseCase";
import { featureFlagEnabledMock } from "../../../__mocks__/featuresFlags/dataTypeMocks/featureFlagData";
import { getFeatureFlagRepositoryMock } from "../../../__mocks__/featuresFlags/repositoryMock";

const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();
let getFeatureFlagByName: GetFeatureFlagByName;

beforeEach(() => {
  getFeatureFlagByName = new GetFeatureFlagByName(featureFlagRepositoryMock);
  jest.clearAllMocks();
});

describe("Get feature flag by name", () => {
  it("should obtain a feature flag by name successfully", async () => {
    featureFlagRepositoryMock.obtainFeatureFlagByName.mockResolvedValueOnce(featureFlagEnabledMock);
    const result = await getFeatureFlagByName.execute("feature_enabled");
    expect(result).toEqual(featureFlagEnabledMock);
    expect(featureFlagRepositoryMock.obtainFeatureFlagByName).toHaveBeenCalledWith("feature_enabled");
  });

  it("should return null for non-existent feature flag name", async () => {
    featureFlagRepositoryMock.obtainFeatureFlagByName.mockResolvedValueOnce(null);
    const result = await getFeatureFlagByName.execute("non_existent_feature");
    expect(result).toBeNull();
    expect(featureFlagRepositoryMock.obtainFeatureFlagByName).toHaveBeenCalledWith("non_existent_feature");
  });

  it("should throw an error when feature name is empty", async () => {
    await expect(getFeatureFlagByName.execute("")).rejects.toThrow("Feature name cannot be empty");
    expect(featureFlagRepositoryMock.obtainFeatureFlagByName).not.toHaveBeenCalled();
  });

  it("should handle errors when obtaining a feature flag by name", async () => {
    featureFlagRepositoryMock.obtainFeatureFlagByName.mockRejectedValue(new Error());
    await expect(getFeatureFlagByName.execute("feature_enabled")).rejects.toThrow();
  });
});