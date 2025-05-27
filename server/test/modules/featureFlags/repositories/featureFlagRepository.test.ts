import FeatureFlagRepository from "../../../../src/modules/FeatureFlags/repositories/FeatureFlagRepository";
import { Pool } from "pg";
import { featureFlagEnabledMock } from "../../../__mocks__/featuresFlags/dataTypeMocks/featureFlagData";
import { FeatureFlagCreationObject, FeatureFlagUpdateObject } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

let repository: FeatureFlagRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

beforeEach(() => {
  poolConnectMock = jest.fn();
  clientQueryMock = jest.fn();
  poolConnectMock.mockResolvedValue({
    query: clientQueryMock,
    release: jest.fn(),
  });
  jest.spyOn(Pool.prototype, "connect").mockImplementation(poolConnectMock);
  repository = new FeatureFlagRepository();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function getFeatureFlagTestData(count: number) {
  return {
    rows: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      feature_name: `feature_${i + 1}`,
      is_enabled: i % 2 === 0, // Alternates between true and false
    })),
  };
}

describe("Obtain feature flags", () => {
  it("should retrieve all feature flags", async () => {
    clientQueryMock.mockResolvedValue(getFeatureFlagTestData(3));
    const featureFlags = await repository.obtainFeatureFlags();
    expect(featureFlags).toHaveLength(3);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT id, feature_name, is_enabled FROM feature_flags",
      undefined
    );
  });

  it("should handle errors when obtaining feature flags", async () => {
    poolConnectMock.mockRejectedValue(new Error("Database connection error"));
    await expect(repository.obtainFeatureFlags()).rejects.toThrow();
  });
});

describe("Obtain feature flag by id", () => {
  it("should retrieve a feature flag by existing ID", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [featureFlagEnabledMock],
    });
    const featureFlag = await repository.obtainFeatureFlagById(1);
    expect(featureFlag).toEqual(featureFlagEnabledMock);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT id, feature_name, is_enabled FROM feature_flags WHERE id = $1",
      [1]
    );
  });

  it("should return null for a non-existing feature flag ID", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });
    const featureFlag = await repository.obtainFeatureFlagById(999);
    expect(featureFlag).toBeNull();
  });

  it("should handle errors when obtaining a feature flag by ID", async () => {
    poolConnectMock.mockRejectedValue(new Error("Database connection error"));
    await expect(repository.obtainFeatureFlagById(1)).rejects.toThrow();
  });
});

describe("Obtain feature flag by name", () => {
  it("should retrieve a feature flag by existing name", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [featureFlagEnabledMock],
    });
    const featureFlag = await repository.obtainFeatureFlagByName("feature_enabled");
    expect(featureFlag).toEqual(featureFlagEnabledMock);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT id, feature_name, is_enabled FROM feature_flags WHERE feature_name = $1",
      ["feature_enabled"]
    );
  });

  it("should return null for a non-existing feature flag name", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });
    const featureFlag = await repository.obtainFeatureFlagByName("non_existent_feature");
    expect(featureFlag).toBeNull();
  });

  it("should handle errors when obtaining a feature flag by name", async () => {
    poolConnectMock.mockRejectedValue(new Error("Database connection error"));
    await expect(repository.obtainFeatureFlagByName("feature_enabled")).rejects.toThrow();
  });
});

describe("Check duplicate feature name", () => {
  it("should return true if feature name already exists", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [{ exists: true }],
    });
    const exists = await repository.checkDuplicateFeatureName("feature_enabled");
    expect(exists).toBe(true);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT EXISTS (SELECT 1 FROM feature_flags WHERE LOWER(feature_name) = LOWER($1))",
      ["feature_enabled"]
    );
  });

  it("should return false if feature name does not exist", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [{ exists: false }],
    });
    const exists = await repository.checkDuplicateFeatureName("new_feature");
    expect(exists).toBe(false);
  });

  it("should handle errors when checking for duplicate feature names", async () => {
    poolConnectMock.mockRejectedValue(new Error("Database connection error"));
    await expect(repository.checkDuplicateFeatureName("feature_enabled")).rejects.toThrow();
  });
});

describe("Create feature flag", () => {
  it("should create a feature flag successfully", async () => {
    // Mock checkDuplicateFeatureName to return false (no duplicate)
    jest.spyOn(repository, "checkDuplicateFeatureName").mockResolvedValue(false);
    
    const newFeatureFlag: FeatureFlagCreationObject = {
      feature_name: "new_feature",
      is_enabled: true,
    };
    
    const createdFeatureFlag = {
      id: 3,
      ...newFeatureFlag,
    };
    
    clientQueryMock.mockResolvedValue({
      rows: [createdFeatureFlag],
    });
    
    const result = await repository.createFeatureFlag(newFeatureFlag);
    
    expect(result).toEqual(createdFeatureFlag);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "INSERT INTO feature_flags (feature_name, is_enabled) VALUES ($1, $2) RETURNING *",
      ["new_feature", true]
    );
  });

  it("should throw an error if feature name already exists", async () => {
    // Mock checkDuplicateFeatureName to return true (duplicate exists)
    jest.spyOn(repository, "checkDuplicateFeatureName").mockResolvedValue(true);
    
    const newFeatureFlag: FeatureFlagCreationObject = {
      feature_name: "existing_feature",
      is_enabled: true,
    };
    
    await expect(repository.createFeatureFlag(newFeatureFlag)).rejects.toThrow(
      "Feature flag with this name already exists"
    );
    
    // Verify that the insert query was not called
    expect(clientQueryMock).not.toHaveBeenCalled();
  });

  it("should handle database errors when creating a feature flag", async () => {
    jest.spyOn(repository, "checkDuplicateFeatureName").mockResolvedValue(false);
    
    const newFeatureFlag: FeatureFlagCreationObject = {
      feature_name: "new_feature",
      is_enabled: true,
    };
    
    clientQueryMock.mockRejectedValue(new Error("Database error"));
    
    await expect(repository.createFeatureFlag(newFeatureFlag)).rejects.toThrow();
  });
});

describe("Update feature flag", () => {
  it("should update a feature flag successfully", async () => {
    // Mock obtainFeatureFlagById to return an existing feature flag
    jest.spyOn(repository, "obtainFeatureFlagById").mockResolvedValue(featureFlagEnabledMock);
    // Mock checkDuplicateFeatureName to return false (no duplicate)
    jest.spyOn(repository, "checkDuplicateFeatureName").mockResolvedValue(false);
    
    const updateData: FeatureFlagUpdateObject = {
      feature_name: "updated_feature",
      is_enabled: false,
    };
    
    const updatedFeatureFlag = {
      id: 1,
      feature_name: "updated_feature",
      is_enabled: false,
    };
    
    clientQueryMock.mockResolvedValue({
      rows: [updatedFeatureFlag],
    });
    
    const result = await repository.updateFeatureFlag(1, updateData);
    
    expect(result).toEqual(updatedFeatureFlag);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "UPDATE feature_flags SET feature_name = $1, is_enabled = $2 WHERE id = $3 RETURNING *",
      ["updated_feature", false, 1]
    );
  });

  it("should return null if feature flag does not exist", async () => {
    // Mock obtainFeatureFlagById to return null (feature flag doesn't exist)
    jest.spyOn(repository, "obtainFeatureFlagById").mockResolvedValue(null);
    
    const updateData: FeatureFlagUpdateObject = {
      is_enabled: false,
    };
    
    const result = await repository.updateFeatureFlag(999, updateData);
    
    expect(result).toBeNull();
    // Verify that the update query was not called
    expect(clientQueryMock).not.toHaveBeenCalled();
  });

  it("should throw an error if updated feature name already exists", async () => {
    // Mock obtainFeatureFlagById to return an existing feature flag
    jest.spyOn(repository, "obtainFeatureFlagById").mockResolvedValue(featureFlagEnabledMock);
    // Mock checkDuplicateFeatureName to return true (duplicate exists)
    jest.spyOn(repository, "checkDuplicateFeatureName").mockResolvedValue(true);
    
    const updateData: FeatureFlagUpdateObject = {
      feature_name: "existing_feature",
    };
    
    await expect(repository.updateFeatureFlag(1, updateData)).rejects.toThrow(
      "Feature flag with this name already exists"
    );
    
    // Verify that the update query was not called
    expect(clientQueryMock).not.toHaveBeenCalled();
  });

  it("should update only the is_enabled field if only that field is provided", async () => {
    // Mock obtainFeatureFlagById to return an existing feature flag
    jest.spyOn(repository, "obtainFeatureFlagById").mockResolvedValue(featureFlagEnabledMock);
    
    const updateData: FeatureFlagUpdateObject = {
      is_enabled: false,
    };
    
    const updatedFeatureFlag = {
      id: 1,
      feature_name: "feature_enabled",
      is_enabled: false,
    };
    
    clientQueryMock.mockResolvedValue({
      rows: [updatedFeatureFlag],
    });
    
    const result = await repository.updateFeatureFlag(1, updateData);
    
    expect(result).toEqual(updatedFeatureFlag);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "UPDATE feature_flags SET is_enabled = $1 WHERE id = $2 RETURNING *",
      [false, 1]
    );
  });

  it("should handle database errors when updating a feature flag", async () => {
    jest.spyOn(repository, "obtainFeatureFlagById").mockResolvedValue(featureFlagEnabledMock);
    jest.spyOn(repository, "checkDuplicateFeatureName").mockResolvedValue(false);
    
    const updateData: FeatureFlagUpdateObject = {
      is_enabled: false,
    };
    
    clientQueryMock.mockRejectedValue(new Error("Database error"));
    
    await expect(repository.updateFeatureFlag(1, updateData)).rejects.toThrow();
  });
});

describe("Delete feature flag", () => {
  it("should delete a feature flag successfully", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [featureFlagEnabledMock],
    });
    
    const result = await repository.deleteFeatureFlag(1);
    
    expect(result).toBe(true);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "DELETE FROM feature_flags WHERE id = $1 RETURNING *",
      [1]
    );
  });

  it("should return false if feature flag does not exist", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [],
    });
    
    const result = await repository.deleteFeatureFlag(999);
    
    expect(result).toBe(false);
  });

  it("should handle database errors when deleting a feature flag", async () => {
    clientQueryMock.mockRejectedValue(new Error("Database error"));
    
    await expect(repository.deleteFeatureFlag(1)).rejects.toThrow();
  });
});