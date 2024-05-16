import SubmissionRepository from "../Repository/SubmissionsRepository"
import { SubmissionCreationObect } from "../Domain/Submission"


class CreateSubmission{
    private adapter: SubmissionRepository;

    constructor(adapter: SubmissionRepository) {
        this.adapter=adapter;
    }

    async execute(submission: SubmissionCreationObect): Promise<SubmissionCreationObect>{
        try{
            const assignmentExist = await this.adapter.assignmentidExistsForSubmission(submission.assignmentid);
            const useridExist = await this.adapter.useridExistsForSubmission(submission.userid);
            if(!assignmentExist){
                throw new Error("Inexistent assignment ID");
            }
            if(!useridExist){
                throw new Error("Inexistent user ID");
            }
            const newSubmission = await this.adapter.CreateSubmission(submission);
            return newSubmission;
        } catch (error){
            throw error;
        }
    }
}

export default CreateSubmission;