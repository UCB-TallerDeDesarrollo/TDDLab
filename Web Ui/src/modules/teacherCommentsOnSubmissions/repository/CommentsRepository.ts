import axios from "axios";
//import { VITE_API } from "../../../../config";
import TeacherCommentsRepositoryInterface from "../domain/CommentsRepositoryInterface";
import { CommentsCreationObject } from "../domain/CommentsInterface";

//Por el momento funciona con este enlace 
const API_URL = "http://localhost:3000/api/commentsSubmission";

//const API_URL = VITE_API + "/commentsSubmission";


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
}

export default TeacherCommentsRepository;