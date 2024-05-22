import axios from "axios";
import { SubmissionCreationObject, SubmissionDataObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

const API_URL = "http://localhost:3000/api/submissions"; //https://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/

class SubmissionRepository implements SubmissionRepositoryInterface {

    async createSubmission(submissionData: SubmissionCreationObject): Promise<void> {
        await axios.post(API_URL, submissionData);
    }
    async checkSubmissionExists(assignmentid: number, userid: number): Promise<{ hasStarted: boolean }> {
        try {
            const response = await axios.get(`${API_URL}/${assignmentid}/${userid}`);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error("Failed to check assignment start status");
            }
        } catch (error) {
            console.error("Error checking assignment start status:", error);
            throw error;
        }
    }

    async getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[]> {
        try {
            const response = await axios.get(`${API_URL}/${assignmentid}`);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error("Failed to get submissions by assignment ID");
            }
        } catch (error) {
            console.error("Error getting submissions by assignment ID:", error);
            throw error;
        }
    }
}


export default SubmissionRepository;