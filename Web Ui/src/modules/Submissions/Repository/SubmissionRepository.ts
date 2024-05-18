import axios from "axios";
import { SubmissionCreationObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

const API_URL = "https://tdd-lab-api-gold.vercel.app/api/submissions"; //https://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/

class SubmissionRepository implements SubmissionRepositoryInterface {

    async createSubmission(submissionData: SubmissionCreationObject): Promise<void> {
        await axios.post(API_URL, submissionData);
    }
}


export default SubmissionRepository;