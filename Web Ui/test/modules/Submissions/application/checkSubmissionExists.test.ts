import { CheckSubmissionExists } from "../../../../src/modules/Submissions/Aplication/checkSubmissionExists";
import { MockSubmissionRepository } from "../../__mocks__/submissions/mockSubmissionsRepository";

let mockRepository: MockSubmissionRepository;
let checkSubmission: CheckSubmissionExists;

beforeEach(() => {
    mockRepository = new MockSubmissionRepository();
    checkSubmission = new CheckSubmissionExists(mockRepository);
});

describe("CheckSubmissionExists", () => {
    it("Should return hasStarted as true if submission exists", async () => {
        jest.spyOn(mockRepository, 'checkSubmissionExists').mockResolvedValue({ hasStarted: true });
        
        const result = await checkSubmission.checkSubmissionExists(1, 1);
        expect(result).toEqual({ hasStarted: true });
        expect(mockRepository.checkSubmissionExists).toHaveBeenCalledWith(1, 1);
    });
    it("Should return hasStarted as false if submission does not exist", async () => {
        jest.spyOn(mockRepository, 'checkSubmissionExists').mockResolvedValue({ hasStarted: false });
        
        const result = await checkSubmission.checkSubmissionExists(1, 1);
        expect(result).toEqual({ hasStarted: false });
        expect(mockRepository.checkSubmissionExists).toHaveBeenCalledWith(1, 1);
    });
    it("Should handle error when checking submission existence", async () => {
        jest.spyOn(mockRepository, 'checkSubmissionExists').mockRejectedValue(new Error('Error checking submission'));

        await expect(checkSubmission.checkSubmissionExists(1, 1)).rejects.toThrow('Error checking submission');
    });
});