import FeatureFlagsController from "../../src/controllers/featureFlags/featureFlagsController";
import { getFeatureFlagRepositoryMock } from "../__mocks__/featuresFlags/repositoryMock";
import {
  getFeatureFlagListMock,
  featureFlagEnabledMock,
} from "../__mocks__/featuresFlags/dataTypeMocks/featureFlagData";
import { createRequest } from "../__mocks__/featuresFlags/requestMock";
import { createResponse } from "../__mocks__/featuresFlags/responseMock";

let controller: FeatureFlagsController;
const featureFlagRepositoryMock = getFeatureFlagRepositoryMock();

beforeEach(() => {
  controller = new FeatureFlagsController(
    featureFlagRepositoryMock
  );
});

describe("Get feature flags", () => {
  it("should respond with status 200 and list of feature flags", async () => {
    const req = createRequest();
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlags.mockResolvedValue(getFeatureFlagListMock());

    await controller.getFeatureFlags(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(getFeatureFlagListMock());
  });
  
  it("should respond with status 500 and error message when obtaining feature flags fails", async () => {
    const req = createRequest();
    const res = createResponse();
    const error = new Error("Failed to obtain feature flags");
    featureFlagRepositoryMock.obtainFeatureFlags.mockRejectedValue(error);

    await controller.getFeatureFlags(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error del servidor" });
  });
});

describe("Get feature flag by ID", () => {
  it("should respond with status 200 and the feature flag", async () => {
    const req = createRequest("1");
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlagById.mockResolvedValue(featureFlagEnabledMock);

    await controller.getFeatureFlagById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(featureFlagEnabledMock);
  });
  
  it("should respond with status 404 and error message for non-existent feature flag", async () => {
    const req = createRequest("999");
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlagById.mockResolvedValue(null);

    await controller.getFeatureFlagById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Feature flag no encontrado" });
  });
  
  it("should respond with status 400 for invalid ID", async () => {
    const req = createRequest("invalid_id");
    const res = createResponse();

    await controller.getFeatureFlagById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
  });
  
  it("should respond with status 500 and error message when getFeatureFlagById fails", async () => {
    const req = createRequest("1");
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlagById.mockRejectedValue(new Error());

    await controller.getFeatureFlagById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error del servidor" });
  });
});

describe("Get feature flag by name", () => {
  it("should respond with status 200 and the feature flag", async () => {
    const req = createRequest("feature_enabled");
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlagByName.mockResolvedValue(featureFlagEnabledMock);

    await controller.getFeatureFlagByName(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(featureFlagEnabledMock);
  });
  
  it("should respond with status 404 and error message for non-existent feature flag", async () => {
    const req = createRequest("non_existent_feature");
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlagByName.mockResolvedValue(null);

    await controller.getFeatureFlagByName(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Feature flag no encontrado" });
  });
  
  it("should respond with status 500 and error message when getFeatureFlagByName fails", async () => {
    const req = createRequest("feature_name");
    const res = createResponse();
    featureFlagRepositoryMock.obtainFeatureFlagByName.mockRejectedValue(new Error());

    await controller.getFeatureFlagByName(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error del servidor" });
  });
});

describe("Create feature flag", () => {
  it("should respond with status 201 and return the created feature flag", async () => {
    const newFeatureFlag = {
      feature_name: "new_feature",
      is_enabled: true
    };
    const createdFeatureFlag = {
      id: 3,
      ...newFeatureFlag
    };
    
    const req = createRequest(undefined, newFeatureFlag);
    const res = createResponse();
    featureFlagRepositoryMock.createFeatureFlag.mockResolvedValue(createdFeatureFlag);

    await controller.createFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdFeatureFlag);
  });
  
  it("should respond with status 400 when feature name is missing", async () => {
    const req = createRequest(undefined, { is_enabled: true });
    const res = createResponse();

    await controller.createFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Nombre del feature es requerido" });
  });
  
  it("should respond with status 500 and error message when feature flag creation fails", async () => {
    const req = createRequest(undefined, { feature_name: "test", is_enabled: true });
    const res = createResponse();
    featureFlagRepositoryMock.createFeatureFlag.mockRejectedValue(new Error());

    await controller.createFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error del servidor" });
  });
});

describe("Delete feature flag", () => {
  it("should respond with status 204 when feature flag deletion is successful", async () => {
    const req = createRequest("1");
    const res = createResponse();
    featureFlagRepositoryMock.deleteFeatureFlag.mockResolvedValue(true);

    await controller.deleteFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
  
  it("should respond with status 400 for invalid ID", async () => {
    const req = createRequest("invalid_id");
    const res = createResponse();

    await controller.deleteFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
  });
  
  it("should respond with status 500 and error message when feature flag deletion fails", async () => {
    const req = createRequest("1");
    const res = createResponse();
    featureFlagRepositoryMock.deleteFeatureFlag.mockRejectedValue(new Error());

    await controller.deleteFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error del servidor" });
  });
});

describe("Update feature flag", () => {
  it("should respond with status 200 and updated feature flag when update is successful", async () => {
    const updateData = {
      feature_name: "updated_feature",
      is_enabled: false
    };
    const updatedFeatureFlag = {
      id: 1,
      ...updateData
    };
    
    const req = createRequest("1", updateData);
    const res = createResponse();
    featureFlagRepositoryMock.updateFeatureFlag.mockResolvedValue(updatedFeatureFlag);

    await controller.updateFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedFeatureFlag);
  });
  
  it("should respond with status 404 and error message when feature flag is not found", async () => {
    const req = createRequest("999", { feature_name: "updated_feature" });
    const res = createResponse();
    featureFlagRepositoryMock.updateFeatureFlag.mockResolvedValue(null);

    await controller.updateFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Feature flag no encontrado" });
  });
  
  it("should respond with status 400 for invalid ID", async () => {
    const req = createRequest("invalid_id", { feature_name: "updated_feature" });
    const res = createResponse();

    await controller.updateFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
  });
  
  it("should respond with status 400 when no update data is provided", async () => {
    const req = createRequest("1", {});
    const res = createResponse();

    await controller.updateFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No se proporcionaron datos para actualizar" });
  });
  
  it("should respond with status 500 and error message when feature flag update fails", async () => {
    const req = createRequest("1", { feature_name: "updated_feature" });
    const res = createResponse();
    featureFlagRepositoryMock.updateFeatureFlag.mockRejectedValue(new Error());

    await controller.updateFeatureFlag(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error del servidor" });
  });
});