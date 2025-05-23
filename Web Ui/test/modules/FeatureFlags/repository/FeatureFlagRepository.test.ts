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

  
});