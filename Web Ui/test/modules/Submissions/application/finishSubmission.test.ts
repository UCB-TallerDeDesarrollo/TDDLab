import { SubmissionUpdateObject } from '../../../../src/modules/Submissions/Domain/submissionInterfaces';
import { FinishSubmission } from '../../../../src/modules/Submissions/Aplication/finishSubmission';
import { MockSubmissionRepository } from "../../__mocks__/submissions/mockSubmissionsRepository";

let mockSubmissionRepository: MockSubmissionRepository;
let finishSubmission: FinishSubmission;
beforeEach(() => {
    mockSubmissionRepository = new MockSubmissionRepository();
    finishSubmission = new FinishSubmission(mockSubmissionRepository);
});

afterEach(() => {
    jest.clearAllMocks();
});


describe('FinishSubmission', () => {
  test('should call finishSubmission with the correct arguments', async () => {
    const submissionId = 1;
    const submissionData: SubmissionUpdateObject = {
      id: submissionId,
      status: 'delivered',
      end_date: new Date(),
      comment: 'Tarea finalizada',
    };

    await finishSubmission.finishSubmission(submissionId, submissionData);

    expect(mockSubmissionRepository.finishSubmission).toHaveBeenCalledWith(
      submissionId,
      submissionData
    );
  });

  test('should throw an error if finishSubmission fails', async () => {
    const submissionId = 1;
    const submissionData: SubmissionUpdateObject = {
      id: submissionId,
      status: 'delivered',
      end_date: new Date(),
      comment: 'Tarea finalizada',
    };

    const errorMessage = 'Error al finalizar la tarea';
    mockSubmissionRepository.finishSubmission.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(
      finishSubmission.finishSubmission(submissionId, submissionData)
    ).rejects.toThrowError(errorMessage);
  });
});