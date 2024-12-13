import axios from "axios";
import {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "../Domain/PracticeSubmissionInterface.ts";
import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface.ts";
import { VITE_API } from "../../../../config.ts";

const API_URL = VITE_API + "/practiceSubmissions";

class PracticeSubmissionRepository
  implements PracticeSubmissionRepositoryInterface
{
  async createPracticeSubmission(
    practiceSubmissionData: PracticeSubmissionCreationObject
  ): Promise<void> {
    await axios.post(API_URL, practiceSubmissionData);
  }
  async checkPracticeSubmissionExists(
    practiceid: number,
    userid: number
  ): Promise<{ hasStarted: boolean }> {
    try {
      const response = await axios.get(`${API_URL}/${practiceid}/${userid}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to check practice start status");
      }
    } catch (error) {
      console.error("Error checking practice start status:", error);
      throw error;
    }
  }

  async getPracticeSubmissionsByPracticeId(
    assignmentid: number
  ): Promise<PracticeSubmissionDataObject[]> {
    try {
      const response = await axios.get(`${API_URL}/${assignmentid}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get practice submissions by ID");
      }
    } catch (error) {
      console.error("Error getting practice submissions by ID:", error);
      throw error;
    }
  }

  async finishPracticeSubmission(
    submissionid: number,
    submissionData: PracticeSubmissionUpdateObject
  ): Promise<void> {
    console.log(submissionData);
    console.log(submissionid);
    console.log(`${API_URL}/${submissionid}`);
    await axios.put(`${API_URL}/${submissionid}`, submissionData);
  }

  async getPracticeSubmissionbyUserandSubmissionId(
    assignmentid: number,
    userid: number
  ): Promise<PracticeSubmissionDataObject> {
    try {
      const response = await axios.get(`${API_URL}/${assignmentid}/${userid}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get practice submission");
      }
    } catch (error) {
      console.error("Error getting practice submission status:", error);
      throw error;
    }
  }
}

export default PracticeSubmissionRepository;
