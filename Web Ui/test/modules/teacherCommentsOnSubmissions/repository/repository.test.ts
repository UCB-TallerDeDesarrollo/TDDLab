import TeacherCommentsRepository from "../../../../src/modules/teacherCommentsOnSubmissions/repository/CommentsRepository";
import axios from "axios";
import { commentDataMock } from "../../__mocks__/submissions/commentDataMock";
import dotenv from 'dotenv';
dotenv.config();

const axiosGetSpy = jest.spyOn(axios, 'get');
const axiosPostSpy = jest.spyOn(axios, 'post');

const mockRepository = new TeacherCommentsRepository();
const API_URL = process.env.VITE_API_URL + '/commentsSubmission';

describe('Get comments by submission ID', () => {
    it('should fetch comments successfully', async () => {
        const mockComments = [commentDataMock];
        axiosGetSpy.mockResolvedValue({ status: 200, data: mockComments });
        
        const result = await mockRepository.getCommentsBySubmissionId(1);
        expect(result).toEqual(mockComments);
        expect(axiosGetSpy).toHaveBeenCalledWith(`${API_URL}/1`);
    });

    it('should handle comments fetch failure', async () => {
        axiosGetSpy.mockResolvedValue({ status: 404 });
        await expect(mockRepository.getCommentsBySubmissionId(1))
            .rejects.toThrowError("Failed to get comments by submission ID");
    });

    it('should handle network error', async () => {
        axiosGetSpy.mockRejectedValue(new Error("Network Error"));
        await expect(mockRepository.getCommentsBySubmissionId(1))
            .rejects.toThrowError("Network Error");
    });
});

describe('Create comment', () => {
    it('should create a comment successfully', async () => {
        const mockResponse = {
            ...commentDataMock,
            id: 1,
            created_at: new Date()
        };
        axiosPostSpy.mockResolvedValue({ status: 201, data: mockResponse });
        
        const result = await mockRepository.createComment(commentDataMock);
        expect(result).toEqual(mockResponse);
        expect(axiosPostSpy).toHaveBeenCalledWith(API_URL, commentDataMock);
    });

    it('should handle comment creation failure', async () => {
        axiosPostSpy.mockResolvedValue({ status: 400 });
        await expect(mockRepository.createComment(commentDataMock))
            .rejects.toThrowError("Failed to create comment");
    });

    it('should handle network error during creation', async () => {
        axiosPostSpy.mockRejectedValue(new Error("Network Error"));
        await expect(mockRepository.createComment(commentDataMock))
            .rejects.toThrowError("Network Error");
    });
});