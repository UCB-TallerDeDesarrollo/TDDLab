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
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // Manejar el error 404 sin mostrarlo en la consola
                return Promise.resolve({ hasStarted: false });
            }
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
            if (axios.isAxiosError(error)) {
                console.error(`Error fetching submissions for assignment ID ${assignmentid}:`, error.message);
                if (error.response?.status === 404) {
                    throw new Error("Submissions not found for the given assignment ID");
                }
            }
            throw error; // Rethrow the error for further handling
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
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return Promise.reject(new Error("Submission not found"));
            }
            return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
    }
}


export default SubmissionRepository;