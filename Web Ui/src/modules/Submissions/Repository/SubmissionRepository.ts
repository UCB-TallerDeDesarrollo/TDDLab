import axios from "axios";
import { SubmissionCreationObject, SubmissionDataObject, SubmissionUpdateObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";
import {VITE_API} from "../../../../config.ts";

const API_URL = VITE_API + "/submissions";

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

    async finishSubmission(submissionid: number, submissionData: SubmissionUpdateObject): Promise<void>{
        console.log(submissionData);
        console.log(submissionid);
        console.log(`${API_URL}/${submissionid}`);
        await axios.put(`${API_URL}/${submissionid}`, submissionData);
    }

    async getSubmissionbyUserandSubmissionId(assignmentid: number, userid: number): Promise<SubmissionDataObject> {
        try {
            const response = await axios.get(`${API_URL}/${assignmentid}/${userid}`);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error("Failed to get submission");
            }
        } catch (error) {
            console.error("Error getting submission status:", error);
            throw error;
        }
    }
}


export default SubmissionRepository;