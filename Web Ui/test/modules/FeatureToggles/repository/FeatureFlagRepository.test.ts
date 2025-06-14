import axios from "axios";
import FeatureFlagRepository from "../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository";
import dotenv from "dotenv";
dotenv.config();

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const API_URL = process.env.VITE_API_URL + '/featureflags';
const repo = new FeatureFlagRepository();

const sampleFlag = {
  id: 1,
  feature_name: "Boton Asistente IA",
  is_enabled: true
};

describe("FeatureFlagRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFlags", () => {
    it("debería retornar todos los feature flags", async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: [sampleFlag] });

      const result = await repo.getFlags();

      expect(result).toEqual([sampleFlag]);
      expect(mockedAxios.get).toHaveBeenCalledWith(API_URL);
    });
  });
   describe("getFlagByName", () => {
    it("debería retornar el feature flag con el nombre especificado", async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: sampleFlag });

      const result = await repo.getFlagByName("Boton Asistente IA");

      expect(result).toEqual(sampleFlag);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/name/Boton Asistente IA`);
    });
  });

  describe("updateFlag", () => {
    it("debería actualizar y retornar el feature flag", async () => {
      const updatedFlag = { ...sampleFlag, is_enabled: false };
      mockedAxios.put.mockResolvedValue({ status: 200, data: updatedFlag });

      const result = await repo.updateFlag(1, { is_enabled: false });

      expect(result).toEqual(updatedFlag);
      expect(mockedAxios.put).toHaveBeenCalledWith(`${API_URL}/1`, { is_enabled: false });
    });
    });
    it("debería retornar null si ocurre un error al buscar por nombre", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      const result = await repo.getFlagByName("noExiste");

     expect(result).toBeNull();
     expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/name/noExiste`);
    });
});
