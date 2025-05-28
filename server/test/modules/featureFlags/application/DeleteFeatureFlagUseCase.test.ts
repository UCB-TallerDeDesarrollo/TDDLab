import DeleteFeatureFlag from "../../../../src/modules/FeatureFlags/application/DeleteFeatureFlagUseCase";
import { getFeatureFlagRepositoryMock } from "../../../__mocks__/featuresFlags/repositoryMock";

const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();
let deleteFeatureFlag: DeleteFeatureFlag;

beforeEach(() => {
  deleteFeatureFlag = new DeleteFeatureFlag(featureFlagRepositoryMock);
  jest.clearAllMocks();
});

describe("Delete feature flag", () => {
  it("should delete a feature flag successfully", async () => {
    featureFlagRepositoryMock.deleteFeatureFlag.mockResolvedValueOnce(true);

    const result = await deleteFeatureFlag.execute(1);
    
    expect(result).toBe(true);
    expect(featureFlagRepositoryMock.deleteFeatureFlag).toHaveBeenCalledWith(1);
  });

  it("should throw an error when feature flag ID is invalid", async () => {
    await expect(deleteFeatureFlag.execute(0)).rejects.toThrow("Invalid feature flag ID");
    expect(featureFlagRepositoryMock.deleteFeatureFlag).not.toHaveBeenCalled();
  });

  it("should throw an error when feature flag is not found", async () => {
    featureFlagRepositoryMock.deleteFeatureFlag.mockResolvedValueOnce(false);

    await expect(deleteFeatureFlag.execute(999)).rejects.toThrow("Feature flag with id 999 not found");
    expect(featureFlagRepositoryMock.deleteFeatureFlag).toHaveBeenCalledWith(999);
  });

  it("should handle errors when deleting a feature flag", async () => {
    featureFlagRepositoryMock.deleteFeatureFlag.mockRejectedValue(new Error("Database error"));

    await expect(deleteFeatureFlag.execute(1)).rejects.toThrow();
  });
});