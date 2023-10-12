import { deleteAssignment } from "../repository/assignment.API"; // Import your assignment model

export const deleteAssignmentUseCase = async (assignmentId: number)  => {
  try {
    // Call the fetchAssignmentById function to get the assignment
    const assignment = await deleteAssignment(assignmentId);
    if (assignment === null) {
      // Handle the case where the assignment was not found (null)
      return null;
    }

    // You can perform any additional logic or data transformation here if needed
    return 'Succesful deletion';
  } catch (error) {
    // Handle any errors that may occur during the fetch
    console.error('Error fetching assignment by ID:', error);
    throw error;
  }
};
