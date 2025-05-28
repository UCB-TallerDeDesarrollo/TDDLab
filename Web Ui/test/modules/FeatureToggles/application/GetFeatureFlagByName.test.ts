import { GetFeatureFlagByName } from "../../../../src/modules/FeatureFlags/application/GetFeatureFlagByName";

import { FeatureFlag } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";
import FeatureFlagRepository from "../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository";
jest.mock("../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository");

describe("GetFeatureFlagByName", () => {
  const mockFeature: FeatureFlag = {
    id: 1,
    feature_name: "Boton Asistente IA",
    is_enabled: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería retornar el feature flag por nombre", async () => {
    
    FeatureFlagRepository.prototype.getFlagByName = jest.fn().mockResolvedValue(mockFeature);

    const useCase = new GetFeatureFlagByName();
    const result = await useCase.execute("asistenteIA");

    expect(result).toEqual(mockFeature);
    expect(FeatureFlagRepository.prototype.getFlagByName).toHaveBeenCalledWith("asistenteIA");
  });

  it("debería retornar null si no encuentra el feature flag", async () => {
    
    FeatureFlagRepository.prototype.getFlagByName = jest.fn().mockResolvedValue(null);

    const useCase = new GetFeatureFlagByName();
    const result = await useCase.execute("noExiste");

    expect(result).toBeNull();
    expect(FeatureFlagRepository.prototype.getFlagByName).toHaveBeenCalledWith("noExiste");
  });
});
