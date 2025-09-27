import axios from "axios";
import PracticesRepository from "../../../../src/modules/Practices/repository/PracticesRepository";
import { PracticeDataObject } from "../../../../src/modules/Practices/domain/PracticeInterface";
import dotenv from "dotenv";
dotenv.config();

jest.mock("axios");
const API_URL = process.env.VITE_API_URL + "/practices";

const repository = new PracticesRepository();

describe("PracticesRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPractices", () => {
    it("should fetch all practices successfully", async () => {
      const mockData: PracticeDataObject[] = [{ id: 1, name: "Practice 1" } as any];
      (axios.get as jest.Mock).mockResolvedValue({ status: 200, data: mockData });

      const result = await repository.getPractices();
      expect(axios.get).toHaveBeenCalledWith(API_URL, { withCredentials: true });
      expect(result).toEqual(mockData);
    });
  });
});