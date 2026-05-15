import { CSSProperties } from "react";
import { Typography, Box } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
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
}: Readonly<AssignmentDetailInfoProps>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 4, mb: 2, mt: 2, width: '100%' }}>
      {/* Columna Izquierda: Título */}
      <Box sx={{ flex: 1, minWidth: '200px' }}>
        <Typography variant="h3" sx={{ fontWeight: '400', color: '#1a1a1a', fontSize: '2.5rem' }}>
          {assignment.title}
        </Typography>
      </Box>

      {/* Columna Central: Grupo e Instrucciones */}
      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: '300px' }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <GroupsIcon sx={{ mr: 1.5, color: "#757575", fontSize: '1.6rem' }} />
          <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '120px' }}>Grupo:</Typography>
          <Typography variant="body1" sx={{ color: '#333', fontSize: '1.05rem' }}>{groupDetails?.groupName}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <NotesOutlinedIcon sx={{ mr: 1.5, mt: 0.3, color: "#757575", fontSize: '1.6rem' }} />
          <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '120px' }}>Instrucciones:</Typography>
          <Typography variant="body1" sx={{ color: '#333', fontSize: '1.05rem', wordBreak: 'break-word' }}>{assignment.description}</Typography>
        </Box>
        
        {/* Información adicional solo para estudiantes */}
        {isStudent(role) && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <AccessTimeIcon sx={{ mr: 1.5, color: "#757575", fontSize: '1.6rem' }} />
              <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '120px' }}>Estado:</Typography>
              <Typography variant="body1" sx={{ color: '#333', fontSize: '1.05rem' }}>{getDisplayStatus(studentSubmission?.status)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LinkIcon sx={{ mr: 1.5, color: "#757575", fontSize: '1.6rem' }} />
              <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '120px' }}>Enlace:</Typography>
              <a href={studentSubmission?.repository_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontSize: '1.05rem', textDecoration: 'none' }}>
                {studentSubmission?.repository_link || "N/A"}
              </a>
            </Box>
            {studentSubmission && studentSubmission.comment && (
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <CommentIcon sx={{ mr: 1.5, mt: 0.3, color: "#757575", fontSize: '1.6rem' }} />
                <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '120px' }}>Comentario:</Typography>
                <Typography variant="body1" sx={{ color: '#333', fontSize: '1.05rem' }}>{studentSubmission.comment}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Columna Derecha: Fechas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: { xs: 'flex-start', md: 'flex-start' }, minWidth: '200px' }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CalendarMonthIcon sx={{ mr: 1.5, color: "#757575", fontSize: '1.6rem' }} />
          <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '100px' }}>Inicio:</Typography>
          <Typography variant="body1" sx={{ color: '#333', fontSize: '1.05rem' }}>{formatDate(assignment.start_date.toString())}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CalendarMonthIcon sx={{ mr: 1.5, color: "#757575", fontSize: '1.6rem' }} />
          <Typography variant="body1" sx={{ color: '#555', fontWeight: 600, fontSize: '1.05rem', minWidth: '100px' }}>Finalización:</Typography>
          <Typography variant="body1" sx={{ color: '#333', fontSize: '1.05rem' }}>{formatDate(assignment.end_date.toString())}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
