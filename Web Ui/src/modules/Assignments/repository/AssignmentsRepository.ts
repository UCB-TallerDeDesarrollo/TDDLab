import axios from "axios"; // Import Axios or your preferred HTTP library
import { AssignmentDataObject } from "../domain/assignmentInterfaces"; // Import your assignment model
import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";
import { VITE_API } from "../../../../config.ts";

const API_URL = VITE_API + "/assignments";


class AssignmentsRepository implements AssignmentsRepositoryInterface {
  async getAssignments(): Promise<AssignmentDataObject[]> {
    try {
      // Send a GET request to fetch assignments from the backend
      const response = await axios.get(API_URL);

      // Check if the response status is successful (e.g., 200 OK)
      if (response.status === 200) {
        // Return the assignments data from the response
        return response.data;
      } else {
        // Handle other response status codes or errors here if needed
        throw new Error("Failed to fetch assignments");
      }
    } catch (error) {
      // Handle any network errors or exceptions that may occur
      console.error("Error fetching assignments:", error);
      throw error;
    }
  }
  async getAssignmentsByGroupid(groupid: number): Promise<AssignmentDataObject[]> {
    try {
      const response = await axios.get(`${API_URL}/groupid/${groupid}`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch assignments by group ID");
      }
    } catch (error) {
      console.error("Error fetching assignments by group ID:", error);
      throw error;
    }
  }

  // Define a function to fetch an assignment by its ID
  async getAssignmentById(
    assignmentId: number
  ): Promise<AssignmentDataObject | null> {
    try {
      // Send a GET request to fetch a specific assignment by ID
      const response = await axios.get(`${API_URL}/${assignmentId}`);
      // Check if the response status is successful (e.g., 200 OK)
      if (response.status === 200) {
        // Return the assignment data from the response
        return response.data;
      } else if (response.status === 404) {
        // Return null if the assignment was not found
        return null;
      } else {
        // Handle other response status codes or errors here if needed
        throw new Error("Failed to fetch assignment by ID");
      }
    } catch (error) {
      // Handle any network errors or exceptions that may occur
      console.error("Error fetching assignment by ID:", error);
      throw error;
    }
  }

  async createAssignment(assignmentData: AssignmentDataObject): Promise<void> {
    try {
      await axios.post(API_URL, assignmentData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message ?? "Error al crear la tarea");
      } else {
        throw new Error("Error de red o desconocido al crear la tarea");
      }
    }
  }

  async updateAssignment(
    assignmentId: number,
    assignmentData: AssignmentDataObject
  ): Promise<void> {
    await axios.put(`${API_URL}/${assignmentId}`, assignmentData);
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    try {
      // Send a GET request to fetch a specific assignment by ID
      const response = await axios.delete(`${API_URL}/${assignmentId}`);

      // Check if the response status is successful (e.g., 200 OK)
      if (response.status === 200) {
        // Return the assignment data from the response
        return response.data;
      } else {
        // Handle other response status codes or errors here if needed
        throw new Error("Failed to delete assignment by ID");
      }
    } catch (error) {
      // Handle any network errors or exceptions that may occur
      console.error("Error deleting assignment by ID:", error);
      throw error;
    }
  }

  async deliverAssignment(
    assignmentId: number,
    assignmentData: AssignmentDataObject
  ): Promise<void> {


    await axios.put(`${API_URL}/${assignmentId}/deliver`, assignmentData);
  }
}

export default AssignmentsRepository;
