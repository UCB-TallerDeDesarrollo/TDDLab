import axios from "axios";
import { VITE_API } from "../../../../config";
import TeacherCommentsRepositoryInterface from "../domain/CommentsRepositoryInterface";
import { CommentsCreationObject } from "../domain/CommentsInterface";

const API_URL = `${VITE_API}/commentsSubmission`;

class TeacherCommentsRepository implements TeacherCommentsRepositoryInterface {
  
  async getCommentsBySubmissionId(submissionId: number): Promise<CommentsCreationObject[]> {
    try {
      const response = await axios.get<CommentsCreationObject[]>(`${API_URL}/${submissionId}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to get comments by submission ID");
      }
    } catch (error) {
      console.error("Error getting comments by submission ID:", error);
      throw error;
    }
  }
  async createComment(commentData: CommentsCreationObject): Promise<CommentsCreationObject> {
    try {
      const response = await axios.post<CommentsCreationObject>(API_URL, commentData);
      if (response.status === 201) { // Suponiendo que 201 Created es el código de éxito
        return response.data;
      } else {
        throw new Error("Failed to create comment");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }
}


export default TeacherCommentsRepository;