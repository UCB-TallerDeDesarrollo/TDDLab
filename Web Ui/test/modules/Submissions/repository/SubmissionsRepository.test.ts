import axios from "axios";
import SubmissionRepository from "../../../../src/modules/Submissions/Repository/SubmissionRepository";
import { submissionInProgressDataMock } from "../../__mocks__/submissions/data/submissionDataMock";
import { SubmissionUpdateObject } from "../../../../src/modules/Submissions/Domain/submissionInterfaces";

const axiosPostSpy = jest.spyOn(axios, 'post');
const axiosGetSpy = jest.spyOn(axios, 'get');
const mockRepository = new SubmissionRepository();

describe('persisted task state', () => {
    it('returns the saved submission, including its ID, after starting', async () => {
        axiosPostSpy.mockResolvedValue({ status: 201, data: submissionInProgressDataMock });
        await expect(mockRepository.createSubmission(submissionInProgressDataMock))
            .resolves.toEqual(submissionInProgressDataMock);
        expect(axiosPostSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('/submissions'), submissionInProgressDataMock, { withCredentials: true }
        );
    });

    it('returns the confirmed delivered state after finishing', async () => {
        const delivered = { ...submissionInProgressDataMock, status: 'delivered' };
        const put = jest.spyOn(axios, 'put').mockResolvedValue({ status: 200, data: delivered });
        await expect(mockRepository.finishSubmission(delivered.id, delivered)).resolves.toEqual(delivered);
        expect(put).toHaveBeenLastCalledWith(
            expect.stringContaining(`/submissions/${delivered.id}`), delivered, { withCredentials: true }
        );
    });

    it('treats only a 404 as a task that has not started', async () => {
        axiosGetSpy.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });
        await expect(mockRepository.getSubmissionbyUserandSubmissionId(25, 1)).resolves.toBeNull();
    });

    it.each([401, 403, 500])('preserves HTTP %s errors instead of returning a pending task', async (status) => {
        const error = Object.assign(new Error('Cannot load saved state'), {
            isAxiosError: true, response: { status },
        });
        axiosGetSpy.mockRejectedValue(error);
        await expect(mockRepository.getSubmissionbyUserandSubmissionId(25, 1)).rejects.toBe(error);
    });
});

describe('Create submission', () => {
    it('should create an submission successfully', async () => {
        axiosPostSpy.mockResolvedValue({ status: 201 });
        await expect(mockRepository.createSubmission(submissionInProgressDataMock)).resolves.not.toThrowError();
    });
})

describe('getSubmissionsByAssignmentId', () => {
    it('should return a list of submissions if the request is successful', async () => {
        const mockSubmissions = [submissionInProgressDataMock];
        const mockResponse = { data: mockSubmissions, status: 200 };
        axiosGetSpy.mockResolvedValue(mockResponse);

        const result = await mockRepository.getSubmissionsByAssignmentId(25);
        expect(result).toEqual(mockSubmissions);
    });

    it('should throw an error if getting submissions fails', async () => {
        axiosGetSpy.mockRejectedValue(new Error('Failed to get submissions by assignment ID'));
        await expect(mockRepository.getSubmissionsByAssignmentId(25)).rejects.toThrowError('Failed to get submissions by assignment ID');
    });

    describe('checkSubmissionExists', () => {
        it('should return a response object with hasStarted property when the request is successful', async () => {
          const mockResponse = { data: { hasStarted: true }, status: 200 };
          axiosGetSpy.mockResolvedValue(mockResponse);
      
          const result = await mockRepository.checkSubmissionExists(25, 1);
          expect(result).toEqual({ hasStarted: true });
        });
      
        it('should throw an error if checking submission exists fails', async () => {
          axiosGetSpy.mockRejectedValue(new Error('Failed to check assignment start status'));
          await expect(mockRepository.checkSubmissionExists(25, 1)).rejects.toThrowError('Failed to check assignment start status');
        });
        it('should throw an error if the response status is not 200', async () => {
            const mockResponse = { status: 400 };
            axiosGetSpy.mockResolvedValue(mockResponse);
          
            await expect(mockRepository.checkSubmissionExists(25, 1)).rejects.toThrowError('Failed to check assignment start status');
        });
    });
    describe('finishSubmission', () => {
        const axiosPutSpy = jest.spyOn(axios, 'put');
        it('should update the submission successfully', async () => {
          const submissionData: SubmissionUpdateObject = {
            id: 1,
            status: 'delivered',
            end_date: new Date(),
            comment: 'Tarea finalizada',
          };
          axiosPutSpy.mockResolvedValue({ status: 200 });
      
          await expect(mockRepository.finishSubmission(1, submissionData)).resolves.not.toThrowError();
        });
      
        it('should throw an error if updating the submission fails', async () => {
          const submissionData: SubmissionUpdateObject = {
            id: 1,
            status: 'delivered',
            end_date: new Date(),
            comment: 'Tarea finalizada',
          };
          axiosPutSpy.mockRejectedValue(new Error('Failed to update submission'));
      
          await expect(mockRepository.finishSubmission(1, submissionData)).rejects.toThrowError('Failed to update submission');
        });
    });

    describe('getSubmissionbyUserandSubmissionId', () => {
        it('should return a submission object when the request is successful', async () => {

            const mockSubmission = submissionInProgressDataMock;
            const mockResponse = { data: mockSubmission, status: 200 };
            axiosGetSpy.mockResolvedValue(mockResponse);

            const result = await mockRepository.getSubmissionbyUserandSubmissionId(25, 1);
            expect(result).toEqual(mockSubmission);
        });

        it('should throw an error if getting the submission fails', async () => {
            axiosGetSpy.mockRejectedValue(new Error('Failed to get submission'));
            await expect(mockRepository.getSubmissionbyUserandSubmissionId(25, 1)).rejects.toThrowError('Failed to get submission');
        });
        it('should throw an error if the response status is not 200', async () => {
            const mockResponse = { status: 400 }; // Simular una respuesta con un código de estado diferente a 200
            axiosGetSpy.mockResolvedValue(mockResponse);
          
            await expect(mockRepository.getSubmissionsByAssignmentId(25)).rejects.toThrowError('Failed to get submissions by assignment ID');
        });
        it('should throw an error if the response status is not 200', async () => {
            const mockResponse = { status: 400 };
            axiosGetSpy.mockResolvedValue(mockResponse);
          
            await expect(mockRepository.getSubmissionbyUserandSubmissionId(25, 1)).rejects.toThrowError('Failed to get submission');
        });
    });
});
