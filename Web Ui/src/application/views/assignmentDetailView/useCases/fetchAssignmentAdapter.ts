import { fetchAssignmentById } from "../../../../modules/Assignments/repository/assignment.API";
import { AssignmentDataObject } from "../../../../modules/Assignments/domain/assignmentInterfaces"; // Import your assignment model

export const fetchAssignmentUseCase = async (assignmentId: number): Promise<AssignmentDataObject | null> => {
  try {
    // Call the fetchAssignmentById function to get the assignment
    const assignment = await fetchAssignmentById(assignmentId);

    if (assignment === null) {
      // Handle the case where the assignment was not found (null)
      return null;
    }

    // You can perform any additional logic or data transformation here if needed

    return assignment;
  } catch (error) {
    // Handle any errors that may occur during the fetch
    console.error('Error fetching assignment by ID:', error);
    throw error;
  }
};
