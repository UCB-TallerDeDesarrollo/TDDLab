import { GetFeatureFlags } from "../../../../src/modules/FeatureFlags/application/GetFeatureFlags";
import FeatureFlagRepository from "../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository";
import { FeatureFlag } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

jest.mock("../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository");

describe("GetFeatureFlags", () => {
  const mockFlags: FeatureFlag[] = [
    { id: 1, feature_name: "Boton Asistente IA", is_enabled: true },
    { id: 2, feature_name: "Mostrar Graficas Adicionales", is_enabled: false }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería retornar todos los feature flags", async () => {
    // @ts-ignore
    FeatureFlagRepository.prototype.getFlags = jest.fn().mockResolvedValue(mockFlags);

    const useCase = new GetFeatureFlags();
    const result = await useCase.execute();

    expect(result).toEqual(mockFlags);
    expect(FeatureFlagRepository.prototype.getFlags).toHaveBeenCalled();
  });
});
