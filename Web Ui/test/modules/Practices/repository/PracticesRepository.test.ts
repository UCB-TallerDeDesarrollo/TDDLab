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
      const mockData: PracticeDataObject[] = [
        { id: 1, name: "Practice 1" } as any,
      ];
      (axios.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockData,
      });

      const result = await repository.getPractices();
      expect(axios.get).toHaveBeenCalledWith(API_URL, {
        withCredentials: true,
      });
      expect(result).toEqual(mockData);
    });
  });
  it("should handle fetch error", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));
    await expect(repository.getPractices()).rejects.toThrow("Network Error");
  });

  describe("getPracticeById", () => {
    it("should fetch practice by ID successfully", async () => {
      const mockPractice: PracticeDataObject = {
        id: 2,
        name: "Practice 2",
      } as any;
      (axios.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockPractice,
      });

      const result = await repository.getPracticeById(2);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/2`, {
        withCredentials: true,
      });
      expect(result).toEqual(mockPractice);
    });

    it("should handle fetch by ID error", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("Not Found"));
      await expect(repository.getPracticeById(999)).rejects.toThrow(
        "Not Found"
      );
    });
  });

  describe("getPracticeByUserId", () => {
    it("should fetch practices by user ID successfully", async () => {
      const mockData: PracticeDataObject[] = [
        { id: 3, name: "Practice 3" } as any,
      ];
      (axios.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockData,
      });

      const result = await repository.getPracticeByUserId(5);
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/user/5`, {
        withCredentials: true,
      });
      expect(result).toEqual(mockData);
    });
    it("should handle fetch by user ID error", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("User Not Found"));
      await expect(repository.getPracticeByUserId(999)).rejects.toThrow(
        "User Not Found"
      );
    });
  });
  describe("createPractice", () => {
    it("should create a practice successfully", async () => {
      (axios.post as jest.Mock).mockResolvedValue({ status: 201 });
      const practice: PracticeDataObject = { id: 4, name: "Practice 4" } as any;
      await expect(repository.createPractice(practice)).resolves.not.toThrow();
      expect(axios.post).toHaveBeenCalledWith(API_URL, practice, {
        withCredentials: true,
      });
    });
    it("should handle creation error", async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error("Create Error"));
      const practice: PracticeDataObject = { id: 5, name: "Practice 5" } as any;
      await expect(repository.createPractice(practice)).rejects.toThrow(
        "Create Error"
      );
    });
  });
});
