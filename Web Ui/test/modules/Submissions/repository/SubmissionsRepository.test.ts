import axios from "axios";
import SubmissionRepository from "../../../../src/modules/Submissions/Repository/SubmissionRepository";
import { submissionInProgressDataMock } from "../../__mocks__/submissions/data/submissionDataMock";

const axiosPostSpy = jest.spyOn(axios, 'post');
const mockRepository = new SubmissionRepository();

describe('Create submission', () => {
    it('should create an submission successfully', async () => {
        axiosPostSpy.mockResolvedValue({ status: 201 });
        await expect(mockRepository.createSubmission(submissionInProgressDataMock)).resolves.not.toThrowError();
    });
})