import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/GetAssignmentDetail";
import { GetGroupDetail } from "../../modules/Groups/application/GetGroupDetail";
import { formatDate } from "../../utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";
import AssignmentsRepository from "../../modules/Assignments/repository/AssignmentsRepository";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { Button, Card, CardContent, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { SubmitAssignment } from "../../modules/Assignments/application/SubmitAssignment";
import { CommentDialog } from "./components/CommentDialog";
import CircularProgress from "@mui/material/CircularProgress";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../modules/Submissions/Aplication/createSubmission";
import { SubmissionCreationObject } from "../../modules/Submissions/Domain/submissionInterfaces";
import { CheckSubmissionExists } from "../../modules/Submissions/Aplication/checkSubmissionExists";
interface AssignmentDetailProps {
  role: string;
  userid: number;
}

function isStudent(role: string) {
  return role === "student";
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ role, userid }) => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(
    null
  );
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
  const [submissionStatus, setSubmissionStatus] = useState<{ [key: string]: boolean }>({});
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(
    null
  );

  const navigate = useNavigate();

  useEffect(() => {
    const assignmentsRepository = new AssignmentsRepository();
    const getAssignmentDetail = new GetAssignmentDetail(assignmentsRepository);

    getAssignmentDetail
      .obtainAssignmentDetail(assignmentid)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentid]);
  useEffect(() => {
    const groupsRepository = new GroupsRepository();
    const getGroupDetail = new GetGroupDetail(groupsRepository);

    if (assignment?.groupid) {
      getGroupDetail
        .obtainGroupDetail(assignment.groupid)
        .then((fetchedGroupDetails) => {
          setGroupDetails(fetchedGroupDetails);
        })
        .catch((error) => {
          console.error("Error fetching group details:", error);
        });
    }
  }, [assignment]);

  useEffect(() => {
    const checkIfStarted = async () => {
      if (assignmentid && userid && userid !== -1) {
        try {
          console.log("the user id is ", userid)
          const submissionRepository = new SubmissionRepository();
          const checkSubmissionExists = new CheckSubmissionExists(submissionRepository);
          const response = await checkSubmissionExists.checkSubmissionExists(assignmentid, userid);
          console.log("The response is ", response)
          setSubmissionStatus((prevStatus) => ({
            ...prevStatus,
            [userid]: !!response,
          }));
        } catch (error) {
          console.error("Error checking submission status:", error);
        }
      }
    };
  
    checkIfStarted();
  }, [assignmentid, userid]);
  
  //const isTaskPending = assignment?.state === "pending";
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
        updatedAssignment.link,
        updatedAssignment.comment
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
      groupid: assignment ? assignment.groupid : 0,
    };
    return updatedAssignment;
  };

  const handleSendGithubLink = async (repository_link: string) => {
    if (assignmentid) {
      const submissionsRepository = new SubmissionRepository();
      const createSubmission = new CreateSubmission(submissionsRepository);
      const startDate = new Date();
      const start_date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const submissionData: SubmissionCreationObject = {
        assignmentid: assignmentid,
        userid: userid,
        status: 'in progress',
        repository_link: repository_link,
        start_date: start_date
      };
      try{
        await createSubmission.createSubmission(submissionData);
        handleCloseLinkDialog();
      } catch (error){
        console.error(error);
      }
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
        alert("Link Invalido, por favor ingrese un link valido.");
      }
    } else {
      alert("No se encontro un link para esta tarea.");
    }
  };

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const [_, setComment] = useState("");

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleSendComment = async (comment: string, link: string) => {
    setComment(comment);
    handleCloseCommentDialog();

    if (assignmentid) {
      const updatedAssignment = await handleFindAssignment(assignmentid, link);
      updatedAssignment.comment = comment;

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {assignment ? (
        <Card variant="elevation" elevation={0}>
          <CardContent>
            <div style={{ marginBottom: "40px" }}>
              <Typography
                variant="h5"
                component="div"
                style={{ fontSize: "30px", lineHeight: "3.8" }}
              >
                {assignment.title}
              </Typography>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <ArchiveOutlinedIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Grupo:</strong> {groupDetails?.groupName}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <NotesOutlinedIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Instrucciones:</strong> {assignment.description}
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <CalendarMonthIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Inicio:</strong>{" "}
                  {formatDate(assignment.start_date.toString())}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <CalendarMonthIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Fecha límite:</strong>{" "}
                  {formatDate(assignment.end_date.toString())}
                </Typography>
              </div>
              {isStudent(role) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <AccessTimeIcon
                    style={{ marginRight: "8px", color: "#666666" }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    style={{ fontSize: "16px", lineHeight: "1.8" }}
                  >
                    <strong>Estado:</strong>{" "}
                    {getDisplayStatus(assignment.state)}
                  </Typography>
                </div>
              )}

              {isStudent(role) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <LinkIcon style={{ marginRight: "8px", color: "#666666" }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    style={{ fontSize: "16px", lineHeight: "1.8" }}
                  >
                    <strong>Enlace:</strong>
                    <a
                      href={assignment.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {assignment.link}
                    </a>
                  </Typography>
                </div>
              )}

              {isStudent(role) &&
                (assignment.comment ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <CommentIcon
                      style={{ marginRight: "8px", color: "#666666" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ fontSize: "16px", lineHeight: "1.8" }}
                    >
                      <strong>Comentario:</strong> {assignment.comment}
                    </Typography>
                  </div>
                ) : null)}
            </div>
            {isStudent(role) && (
              <Button
              variant="contained"
              disabled={submissionStatus[userid.toString()]||false}
              onClick={handleOpenLinkDialog}
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Iniciar tarea
            </Button>
            )}

            {isStudent(role) && (
              <Button
                variant="contained"
                disabled={!isTaskInProgressOrDelivered}
                onClick={handleRedirect}
                color="primary"
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Ver gráfica
              </Button>
            )}
            <GitLinkDialog
              open={linkDialogOpen}
              onClose={handleCloseLinkDialog}
              onSend={handleSendGithubLink}
            />

            {isStudent(role) && (
              <Button
                variant="contained"
                disabled={isTaskDeliveredOrPending}
                onClick={handleOpenCommentDialog}
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Finalizar tarea
              </Button>
            )}

            <CommentDialog
              open={isCommentDialogOpen}
              link={assignment?.link}
              onSend={handleSendComment}
              onClose={handleCloseCommentDialog}
            />
          </CardContent>
        </Card>
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
