import { UpdateFeatureFlag } from "../../../../src/modules/FeatureFlags/application/UpdateFeatureFlag";
import FeatureFlagRepository from "../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository";
import { FeatureFlag } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

jest.mock("../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository");

describe("UpdateFeatureFlag", () => {
  const updatedFlag: FeatureFlag = {
    id: 1,
    feature_name: "Boton Asistente IA",
    is_enabled: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería actualizar y retornar el feature flag", async () => {
    FeatureFlagRepository.prototype.updateFlag = jest.fn().mockResolvedValue(updatedFlag);

    const useCase = new UpdateFeatureFlag();
    const result = await useCase.execute(1, false);

    expect(result).toEqual(updatedFlag);
    expect(FeatureFlagRepository.prototype.updateFlag).toHaveBeenCalledWith(1, { is_enabled: false });
  });
});
