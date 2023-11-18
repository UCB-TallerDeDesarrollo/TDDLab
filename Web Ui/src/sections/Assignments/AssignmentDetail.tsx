import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/GetAssignmentDetail";
import { formatDate } from "../../utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";
import AssignmentsRepository from "../../modules/Assignments/repository/AssignmentsRepository";
import { Button } from "@mui/material";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { SubmitAssignment } from "../../modules/Assignments/application/SubmitAssignment";
import { CommentDialog } from "./components/CommentDialog";
import CircularProgress from "@mui/material/CircularProgress";
import { getSessionCookie } from "../Login/cookieService"; 
import { setGlobalState} from "../../modules/Auth/domain/authStates";
const AssignmentDetail: React.FC = () => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(
    null
  );
  const [linkDialogOpen, setLinkDialogOpen] = useState(false); // State for GitHub link dialog visibility
  const { id } = useParams();
  const assignmentId = Number(id);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("entrando a sessionCookie");
    const storedSession = getSessionCookie();
    if (storedSession) {
      setGlobalState('authData', {
        userProfilePic: storedSession.photoURL,
        userEmail: storedSession.email,
        userCourse: storedSession.course,
      });
    }

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

  const isTaskDeliveredOrPending =
    assignment?.state === "delivered" || assignment?.state === "pending";

  const handleUpdateAssignment = async (
    updatedAssignment: AssignmentDataObject
  ) => {
    const assignmentsRepository = new AssignmentsRepository();
    const submitAssignment = new SubmitAssignment(assignmentsRepository);

    try {
      await submitAssignment.submitAssignment(
        updatedAssignment.id,
        updatedAssignment.link
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleFindAssignment = async (assignmentId: number, link: string) => {
    const updatedAssignment = {
      id: assignmentId,
      title: assignment ? assignment.title : "",
      description: assignment ? assignment.description : "",
      start_date: assignment ? assignment.start_date : new Date(),
      end_date: assignment ? assignment.end_date : new Date(),
      state: assignment ? assignment.state : "",
      link: link,
      comment: assignment ? assignment.comment : "",
    };
    return updatedAssignment;
  };

  const handleSendGithubLink = async (link: string) => {
    if (assignmentId) {
      const updatedAssignment = await handleFindAssignment(assignmentId, link);

      await handleUpdateAssignment(updatedAssignment);

      setAssignment(updatedAssignment);
      handleCloseLinkDialog();
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

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [, setComment] = useState("");

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleSendComment = async (comment: string, link: string) => {
    setComment(comment);
    handleCloseCommentDialog();

    if (assignmentId) {
      const updatedAssignment = await handleFindAssignment(assignmentId, link);

      console.log(updatedAssignment);

      await handleUpdateAssignment(updatedAssignment);

      window.location.reload();
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in progress":
        return "En progreso";
      case "delivered":
        return "Enviado";
      default:
        return status;
    }
  };

  return (
    <div>
      {assignment ? (
        <div>
          <h2>{assignment.title}</h2>
          <p>Descripción: {assignment.description}</p>
          <p>Fecha Inicio: {formatDate(assignment.start_date.toString())}</p>
          <p>Fecha Fin: {formatDate(assignment.end_date.toString())}</p>
          <p>Estado: {getDisplayStatus(assignment.state)}</p>
          <p>Enlace: {assignment.link}</p>
          {assignment.comment ? <p>Comentario: {assignment.comment}</p> : null}

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
            open={linkDialogOpen}
            onClose={handleCloseLinkDialog}
            onSend={handleSendGithubLink}
          />

          <Button
            variant="contained"
            disabled={isTaskDeliveredOrPending}
            onClick={handleOpenCommentDialog}
          >
            Enviar Tarea
          </Button>

          <CommentDialog
            open={isCommentDialogOpen}
            link={assignment?.link}
            onSend={handleSendComment}
            onClose={handleCloseCommentDialog}
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "250px",
          }}
        >
          <CircularProgress size={60} thickness={5} />
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;
