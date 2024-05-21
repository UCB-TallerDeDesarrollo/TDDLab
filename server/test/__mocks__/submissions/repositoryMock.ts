
export function getSubmissionRepositoryMock() {
    return {
        CreateSubmission: jest.fn(),
        executeQuery: jest.fn(),
        mapRowToSubmissions: jest.fn(),
        ObtainSubmissions: jest.fn(),
        UpdateSubmission: jest.fn(),
        deleteSubmission: jest.fn(),
        assignmentidExistsForSubmission: jest.fn(),
        useridExistsForSubmission: jest.fn(),
        getSubmissionByAssignmentAndUser : jest.fn(),
        getSubmissionsByAssignmentId: jest.fn(), 
    }
}