import GetFeatureFlags from "../../../../src/modules/FeatureFlags/application/GetFeatureFlagsUseCase";
import { getFeatureFlagListMock } from "../../../__mocks__/featuresFlags/dataTypeMocks/featureFlagData";
import { getFeatureFlagRepositoryMock } from "../../../__mocks__/featuresFlags/repositoryMock";

const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();
let getFeatureFlags: GetFeatureFlags;

beforeEach(() => {
  getFeatureFlags = new GetFeatureFlags(featureFlagRepositoryMock);
  jest.clearAllMocks();
});

describe("Get feature flags", () => {
  it("should obtain feature flags successfully", async () => {
    const mockFeatureFlags = getFeatureFlagListMock();
    featureFlagRepositoryMock.obtainFeatureFlags.mockResolvedValueOnce(mockFeatureFlags);
    const result = await getFeatureFlags.execute();
    expect(result).toEqual(mockFeatureFlags);
    expect(featureFlagRepositoryMock.obtainFeatureFlags).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when obtaining feature flags", async () => {
    featureFlagRepositoryMock.obtainFeatureFlags.mockRejectedValue(new Error());
    await expect(getFeatureFlags.execute()).rejects.toThrow();
  });
});