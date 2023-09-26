// Import any necessary dependencies
import axios from 'axios'; // If you're using Axios

// Define the URL of your backend API
const API_URL = '/api/assignment'; // Adjust this URL according to your backend's URL structure

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
