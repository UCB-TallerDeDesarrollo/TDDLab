import React, { useEffect, useState } from "react";
import { fetchAssignmentUseCase } from "../useCases/fetchAssignmentAdapter";
import { formatDate } from "../../../../application/utils/dateUtils";
import { AssignmentDataObject } from "../../../../domain/models/assignmentInterfaces";
import { useParams } from "react-router-dom";

const AssignmentDetail: React.FC = () => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(
    null
  );
  const { id } = useParams();
  const assignmentId = Number(id);

  useEffect(() => {
    // Fetch the assignment by its ID when the component mounts
    fetchAssignmentUseCase(assignmentId)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentId]);

  return (
    <div>
      {assignment ? (
        <div>
          <h2>{assignment.title}</h2>
          <p>Descripcion: {assignment.description}</p>
          {/* Convert Date objects to strings using toISOString */}
          <p>Fecha Inicio: {formatDate(assignment.start_date.toString())}</p>
          <p>End Date: {formatDate(assignment.end_date.toString())}</p>
          <p>State: {assignment.state}</p>
        </div>
      ) : (
        <p>Loading assignment...</p>
      )}
    </div>
  );
};

export default AssignmentDetail;
