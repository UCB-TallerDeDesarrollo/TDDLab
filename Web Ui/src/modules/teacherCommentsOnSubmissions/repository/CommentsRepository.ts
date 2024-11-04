import axios from "axios";
//import { VITE_API } from "../../../../config";
import TeacherCommentsRepositoryInterface from "../domain/CommentsRepositoryInterface";
import { CommentDataObject,CommentsCreationObject } from "../domain/CommentsInterface";

//Por el momento funciona con este enlace 
const API_URL = "http://localhost:3000/api/commentsSubmission";

//const API_URL = VITE_API + "/commentsSubmission";


class TeacherCommentsRepository implements TeacherCommentsRepositoryInterface {
  
  async getCommentsBySubmissionId(submissionId: number): Promise<CommentDataObject[]> {
    try {
      const response = await axios.get<CommentDataObject[]>(`${API_URL}/${submissionId}`);
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
  async createComment(commentData: CommentsCreationObject): Promise<CommentDataObject> { 
    try {
      const response = await axios.post<CommentDataObject>(API_URL, commentData);
      if (response.status === 201) { 
        return response.data; 
      } else {
        throw new Error("Failed to create comment");
      }
    } catch (error) {
      console.error("Error al crear el comentario:", error);
      throw error;
    }
}


}


export default TeacherCommentsRepository;