import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import { fetchAssignmentById, updateAssignment } from "../repository/assignment.API";

export const sendAssignemtUseCase = async (assignmentId: number) => {
    try{
    const foundAssignment:AssignmentDataObject | null = await fetchAssignmentById(assignmentId);

    if (foundAssignment !== null){
        foundAssignment.state = 'delivered'
        return await updateAssignment(assignmentId, foundAssignment);
    }
    else{
        throw new Error("No se encontro la tarea")
    }
    } catch(error){
        console.error(error);
        throw error;
    }
  }
  
  