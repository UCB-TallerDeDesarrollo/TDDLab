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
  describe("deletePractice", () => {
    it("should delete a practice successfully", async () => {
      (axios.delete as jest.Mock).mockResolvedValue({ status: 200, data: {} });
      await expect(repository.deletePractice(8)).resolves.not.toThrow();
      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/8`, {
        withCredentials: true,
      });
    });
    it("should handle deletion error", async () => {
      (axios.delete as jest.Mock).mockRejectedValue(new Error("Delete Error"));
      await expect(repository.deletePractice(9)).rejects.toThrow(
        "Delete Error"
      );
    });
    it("should throw error if getPracticeById returns non-200 status", async () => {
      (axios.get as jest.Mock).mockResolvedValue({ status: 404, data: null });
      await expect(repository.getPracticeById(123)).rejects.toThrow(
        "Failed to fetch practices by ID"
      );
    });
  });

  describe("updatePractice", () => {
    it("should update a practice successfully", async () => {
      (axios.put as jest.Mock).mockResolvedValue({ status: 200 });
      const practice: PracticeDataObject = { id: 6, name: "Practice 6" } as any;
      await expect(
        repository.updatePractice(6, practice)
      ).resolves.not.toThrow();
      expect(axios.put).toHaveBeenCalledWith(`${API_URL}/6`, practice, {
        withCredentials: true,
      });
    });
    it("should handle update error", async () => {
      (axios.put as jest.Mock).mockRejectedValue(new Error("Update Error"));
      const practice: PracticeDataObject = { id: 7, name: "Practice 7" } as any;
      await expect(repository.updatePractice(7, practice)).rejects.toThrow(
        "Update Error"
      );
    });
  });
});
