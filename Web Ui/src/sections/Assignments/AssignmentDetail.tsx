import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/fetchAssignmentAdapter";
import { formatDate } from "../../application/utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { useParams } from "react-router-dom";
import AssignmentsRepository from '../../modules/Assignments/repository/assignment.API';  

const AssignmentDetail: React.FC = () => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(
    null
  );
  const { id } = useParams();
  const assignmentId = Number(id);

  useEffect(() => {
    // Fetch the assignment by its ID when the component mounts
    const assignmentsRepository = new AssignmentsRepository();
    const getAsignmentDetail = new GetAssignmentDetail(assignmentsRepository);
    getAsignmentDetail.obtainAssignmentDetail(assignmentId)
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
