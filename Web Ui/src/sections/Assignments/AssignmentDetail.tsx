import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/GetAssignmentDetail";
import { formatDate } from "../../utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { useParams } from "react-router-dom";
import AssignmentsRepository from "../../modules/Assignments/repository/AssignmentsRepository";
import { Button } from "@mui/material";
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
    getAsignmentDetail
      .obtainAssignmentDetail(assignmentId)
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
          <p>Descripción: {assignment.description}</p>
          {/* Convert Date objects to strings using toISOString */}
          <p>Fecha Inicio: {formatDate(assignment.start_date.toString())}</p>
          <p>Fecha Fin: {formatDate(assignment.end_date.toString())}</p>
          <p>Estado: {assignment.state}</p>
          <p>Enlace: {assignment.link}</p>

          <Button variant="contained"> Iniciar tarea </Button>
        </div>
      ) : (
        <p>Cargando Tarea...</p>
      )}
    </div>
  );
};

export default AssignmentDetail;
