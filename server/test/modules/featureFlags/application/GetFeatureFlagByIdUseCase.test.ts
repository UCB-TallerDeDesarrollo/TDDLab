import GetFeatureFlagById from "../../../../src/modules/FeatureFlags/application/GetFeatureFlagByIdUseCase";
import { featureFlagEnabledMock } from "../../../__mocks__/featuresFlags/dataTypeMocks/featureFlagData";
import { getFeatureFlagRepositoryMock } from "../../../__mocks__/featuresFlags/repositoryMock";

const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();
let getFeatureFlagById: GetFeatureFlagById;

beforeEach(() => {
  getFeatureFlagById = new GetFeatureFlagById(featureFlagRepositoryMock);
  jest.clearAllMocks();
});

describe("Get feature flag by ID", () => {
  it("should obtain a feature flag by ID successfully", async () => {
    featureFlagRepositoryMock.obtainFeatureFlagById.mockResolvedValueOnce(featureFlagEnabledMock);
    const result = await getFeatureFlagById.execute(1);
    expect(result).toEqual(featureFlagEnabledMock);
    expect(featureFlagRepositoryMock.obtainFeatureFlagById).toHaveBeenCalledWith(1);
  });

  it("should return null for non-existent feature flag ID", async () => {
    featureFlagRepositoryMock.obtainFeatureFlagById.mockResolvedValueOnce(null);
    const result = await getFeatureFlagById.execute(999);
    expect(result).toBeNull();
    expect(featureFlagRepositoryMock.obtainFeatureFlagById).toHaveBeenCalledWith(999);
  });

  it("should handle errors when obtaining a feature flag by ID", async () => {
    featureFlagRepositoryMock.obtainFeatureFlagById.mockRejectedValue(new Error());
    await expect(getFeatureFlagById.execute(1)).rejects.toThrow();
  });
});