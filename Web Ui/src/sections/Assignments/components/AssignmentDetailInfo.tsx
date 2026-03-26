import { CSSProperties } from "react";
import { Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { formatDate } from "../../../utils/dateUtils";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { getDisplayStatus, isStudent } from "../utils/assignmentDetailHelpers";
import { typographyVariants } from "../../../styles/typography";

interface AssignmentDetailInfoProps {
  assignment: AssignmentDataObject;
  groupDetails: GroupDataObject | null;
  role: string;
  studentSubmission?: SubmissionDataObject;
  detailTextStyle: CSSProperties;
}

export function AssignmentDetailInfo({
  assignment,
  groupDetails,
  role,
  studentSubmission,
  detailTextStyle,
}: Readonly<AssignmentDetailInfoProps>) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <Typography
        variant="h5"
        component="div"
        style={{ ...typographyVariants.h3, lineHeight: "3.8" }}
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
          style={detailTextStyle}
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
          style={detailTextStyle}
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
          style={detailTextStyle}
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
          style={detailTextStyle}
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
            style={detailTextStyle}
          >
            <strong>Estado:</strong>{" "}
            {getDisplayStatus(studentSubmission?.status)}
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
            style={detailTextStyle}
          >
            <strong>Enlace:</strong>
            <a
              href={studentSubmission?.repository_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {studentSubmission?.repository_link}
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
              style={detailTextStyle}
            >
              <strong>Comentario:</strong>{" "}
              {studentSubmission?.repository_link === "" || studentSubmission == null}
            </Typography>
          </div>
        ) : null)}
    </div>
  );
}
