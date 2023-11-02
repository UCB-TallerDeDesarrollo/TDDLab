import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/GetAssignmentDetail";
import { formatDate } from "../../utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";
import AssignmentsRepository from "../../modules/Assignments/repository/AssignmentsRepository";
import { Button } from "@mui/material";
import { GitLinkDialog } from "./components/GitHubLinkDialog"; // Import your GitHub link dialog component
import { SubmitAssignment } from "../../modules/Assignments/application/SubmitAssignment";

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
        //console.log(fetchedAssignment);
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentId]);

  const isTaskPending = assignment?.state === "pending";

  const isTaskInProgressOrDelivered =
    assignment?.state === "in progress" || assignment?.state === "delivered";

  const handleSendGithubLink = async (link: string) => {
    if (assignmentId) {
      const updatedAssignment = {
        id: assignmentId,
        title: assignment ? assignment.title : "",
        description: assignment ? assignment.description : "",
        start_date: assignment ? assignment.start_date : new Date(),
        end_date: assignment ? assignment.end_date : new Date(),
        state: assignment ? assignment.state : "",
        link: link,
      };

      const assignmentsRepository = new AssignmentsRepository();
      const submitAssignment = new SubmitAssignment(assignmentsRepository);

      try {
        console.log(updatedAssignment);

        await submitAssignment.submitAssignment(
          updatedAssignment.id,
          updatedAssignment.link
        );
      } catch (error) {
        console.error(error);
      }

      // Update the assignment state with the new link
      setAssignment(updatedAssignment);

      // Close the GitHub link dialog after updating the link
      handleCloseLinkDialog();

      //reloads page
      window.location.reload();
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const handleRedirect = () => {
    if (assignment?.link) {
      const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
      const match = regex.exec(assignment.link);

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
