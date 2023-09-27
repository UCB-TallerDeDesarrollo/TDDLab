import axios from 'axios'; // Import Axios or your preferred HTTP library
import { AssignmentDataObject } from '../domain/models/assignmentInterfaces'; // Import your assignment model

const API_URL = 'https://tdd-lab-bvs2voy73-tddlabs-projects.vercel.app/api/assignments';

// Define a function to fetch assignments
export const fetchAssignments = async () => {
  try {
    // Send a GET request to fetch assignments from the backend
    const response = await axios.get(API_URL);

    // Check if the response status is successful (e.g., 200 OK)
    if (response.status === 200) {
      // Return the assignments data from the response
      return response.data;
    } else {
      // Handle other response status codes or errors here if needed
      throw new Error('Failed to fetch assignments');
    }
  } catch (error) {
    // Handle any network errors or exceptions that may occur
    console.error('Error fetching assignments:', error);
    throw error;
  }
};




// Define a function to fetch an assignment by its ID
export const fetchAssignmentById = async (assignmentId: number): Promise<AssignmentDataObject | null> => {
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
      throw new Error('Failed to fetch assignment by ID');
    }
  } catch (error) {
    // Handle any network errors or exceptions that may occur
    console.error('Error fetching assignment by ID:', error);
    throw error;
  }
};


export const createAssignment = async (assignmentData: AssignmentDataObject): Promise<void> => {
  // Send a POST request to create a new assignment
  await axios.post(API_URL, assignmentData);
};

export const updateAssignment = async (assignmentData: AssignmentDataObject): Promise<void> => {
  // Send a PUT request to update an assignment
  await axios.put(`${API_URL}/${assignmentData.id}`, assignmentData);
};

export const deleteAssignment = async (assignmentId: number): Promise<void> => {
  try {
    // Send a GET request to fetch a specific assignment by ID
    const response = await axios.delete(`${API_URL}/${assignmentId}`);

    // Check if the response status is successful (e.g., 200 OK)
    if (response.status === 200) {
      // Return the assignment data from the response
      return response.data;
    } else {
      // Handle other response status codes or errors here if needed
      throw new Error('Failed to delete assignment by ID');
    }
  } catch (error) {
    // Handle any network errors or exceptions that may occur
    console.error('Error deleting assignment by ID:', error);
    throw error;
  }
};
