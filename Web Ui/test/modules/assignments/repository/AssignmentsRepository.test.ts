import AssignmentsRepository from "../../../../src/modules/Assignments/repository/AssignmentsRepository";
import axios from "axios";
import { assignmentInProgresDataMock } from "../../__mocks__/assignments/data/assigmentDataMock";
import dotenv from 'dotenv';
dotenv.config()

const axiosGetSpy = jest.spyOn(axios, 'get');
const axiosPostSpy = jest.spyOn(axios, 'post');
const axiosPutSpy = jest.spyOn(axios, 'put');
const axiosDeleteSpy = jest.spyOn(axios, 'delete');

const mockRepository = new AssignmentsRepository();
const API_URL = process.env.VITE_API_URL + '/assignments'
describe('Get assignments', () => {
    it('should fetch assignments successfully', async () => {
        axiosGetSpy.mockResolvedValue({ status: 200, data: assignmentInProgresDataMock });
        const result = await mockRepository.getAssignments();
        expect(result).toEqual(assignmentInProgresDataMock);
    });

    it('should handle assignment fetch failure', async () => {
        axiosGetSpy.mockResolvedValue({ status: 404 });
        await expect(mockRepository.getAssignments()).rejects.toThrowError();
    });

    it('should handle assignment fetch error', async () => {
        axiosGetSpy.mockRejectedValue(new Error);
        await expect(mockRepository.getAssignments()).rejects.toThrowError();
    });
});

describe('Get assignments by group ID', () => {
    it('should fetch assignments by group ID successfully', async () => {
        const mockAssignments = [
            { id: 1, title: 'Assignment 1', groupId: 1 },
            { id: 2, title: 'Assignment 2', groupId: 1 },
        ];
        axiosGetSpy.mockResolvedValue({ status: 200, data: mockAssignments });

        const result = await mockRepository.getAssignmentsByGroupid(1);
        expect(result).toEqual(mockAssignments);
        expect(axiosGetSpy).toHaveBeenCalledWith(`${API_URL}/groupid/1`);
    });
    it('should handle fetch failure for group ID', async () => {
        axiosGetSpy.mockResolvedValue({ status: 404 });
        await expect(mockRepository.getAssignmentsByGroupid(1)).rejects.toThrowError("Failed to fetch assignments by group ID");
    });
    it('should handle fetch error for group ID', async () => {
        axiosGetSpy.mockRejectedValue(new Error("Network Error"));
        await expect(mockRepository.getAssignmentsByGroupid(1)).rejects.toThrowError("Network Error");
    });
});
describe('Get assignment by ID', () => {
    it('should fetch an assignment by ID successfully', async () => {
        axiosGetSpy.mockResolvedValue({ status: 200, data: assignmentInProgresDataMock });
        const assignmentSearched = await mockRepository.getAssignmentById(1);
        expect(assignmentSearched).toEqual(assignmentInProgresDataMock);
    });

    it('should return null when fetching a non-existent assignment', async () => {
        axiosGetSpy.mockResolvedValue({ status: 404 });
        const assignmentSearched = await mockRepository.getAssignmentById(1);
        expect(assignmentSearched).toBeNull();
    });

    it('should handle resource gone when deleting', async () => {
        axiosGetSpy.mockResolvedValue({ status: 410 });
        await expect(mockRepository.getAssignmentById(1)).rejects.toThrowError();
    });

    it('should handle assignment fetch error', async () => {
        axiosGetSpy.mockRejectedValue(new Error);
        await expect(mockRepository.getAssignmentById(1)).rejects.toThrowError();
    });
});

describe('Create assignment', () => {
    it('should create an assignment successfully', async () => {
        axiosPostSpy.mockResolvedValue({ status: 201 });
        await expect(mockRepository.createAssignment(assignmentInProgresDataMock)).resolves.not.toThrowError();
    });
});

describe('Update assignment', () => {
    it('should update an assignment successfully', async () => {
        axiosPutSpy.mockResolvedValue({ status: 201 });
        await expect(mockRepository.updateAssignment(1, assignmentInProgresDataMock)).resolves.not.toThrowError();
    });
});

describe('Delete assignment', () => {
    it('should delete an assignment successfully', async () => {
        const response = { status: 200, data: { message: 'Assignment deleted successfully' } };
        axiosDeleteSpy.mockResolvedValue(response);
        await expect(mockRepository.deleteAssignment(1)).resolves.not.toThrowError();
    });

    it('should handle assignment delete failure', async () => {
        axiosDeleteSpy.mockResolvedValue({ status: 404 });
        await expect(mockRepository.deleteAssignment(1)).rejects.toThrowError();
    });

    it('should handle network error during assignment deletion', async () => {
        axiosDeleteSpy.mockRejectedValue(new Error);
        await expect(mockRepository.deleteAssignment(1)).rejects.toThrowError();
    });
});

describe('Deliver assignment', () => {
    it('should deliver an assignment successfully', async () => {
        axiosPutSpy.mockResolvedValue({ status: 200 });
        await expect(mockRepository.deliverAssignment(1, assignmentInProgresDataMock)).resolves.not.toThrowError();
    });
});