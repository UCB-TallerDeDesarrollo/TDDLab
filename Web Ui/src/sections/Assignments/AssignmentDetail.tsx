import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/GetAssignmentDetail";
import { formatDate } from "../../utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";
import AssignmentsRepository from "../../modules/Assignments/repository/AssignmentsRepository";
import { Button } from "@mui/material";
import { GitLinkDialog } from "./components/GitHubLinkDialog"; // Import your GitHub link dialog component

const AssignmentDetail: React.FC = () => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(
    null
  );
  const [isLinkDialogOpen, setLinkDialogOpen] = useState(false); // State for GitHub link dialog visibility
  const { id } = useParams();
  const assignmentId = Number(id);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the assignment by its ID when the component mounts
    const assignmentsRepository = new AssignmentsRepository();
    const getAssignmentDetail = new GetAssignmentDetail(assignmentsRepository);
    getAssignmentDetail
      .obtainAssignmentDetail(assignmentId)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentId]);

  const isTaskPending = assignment?.state === "pending";
  const isTaskInProgressOrDelivered =
    assignment?.state === "in progress" || assignment?.state === "delivered";

  const handleSendGithubLink = (link: string) => {
    if (assignment) {
      // Make an API call to update the assignment link in the database
      // You can use the assignmentsRepository or any other method to update the assignment link
      const updatedAssignment = {
        ...assignment,
        link: link,
      };

      // Update the assignment state with the new link
      setAssignment(updatedAssignment);

      // Close the GitHub link dialog after updating the link
      handleCloseLinkDialog();
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const handleRedirect = () => {
    if (assignment && assignment.link) {
      const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
      const match = assignment.link.match(regex);

      if (match) {
        const [, user, repo] = match;
        console.log(user, repo);
        navigate({
          pathname: "/graph",
          search: createSearchParams({
            repoOwner: user,
            repoName: repo,
          }).toString(),
        });
      } else {
        alert(
          "Invalid GitHub URL. Please enter a valid GitHub repository URL."
        );
      }
    } else {
      alert("No GitHub URL found for this assignment.");
    }
  };

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
          <p>Link: {assignment.link}</p>

          <Button
            variant="contained"
            disabled={!isTaskPending}
            onClick={handleOpenLinkDialog}
          >
            Iniciar tarea
          </Button>
          <Button
            disabled={!isTaskInProgressOrDelivered}
            onClick={handleRedirect}
            color="primary"
          >
            Ver grafica
          </Button>

          <GitLinkDialog
            open={isLinkDialogOpen}
            onClose={handleCloseLinkDialog}
            onSend={handleSendGithubLink}
          />
        </div>
      ) : (
        <p>Cargando Tarea...</p>
      )}
    </div>
  );
};

export default AssignmentDetail;
