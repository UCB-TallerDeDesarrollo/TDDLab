import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

interface AssignmentProps {
  assignment: AssignmentDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleClickUpdate: (index: number) => void;
  handleRowHover: (index: number | null) => void;
}

const Assignment: React.FC<AssignmentProps> = ({
  assignment,
  index,
  handleClickDetail,
  handleClickDelete,
  handleClickUpdate,
  handleRowHover,
}) => {
  return (
    <TableRow key={assignment.id}>
      <TableCell>{assignment.title}</TableCell>
      <TableCell>
        <div style={{ display: "flex", gap: "8px" }}>
          <IconButton
            aria-label="see"
            onClick={() => handleClickDetail(index)}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => handleClickDelete(index)}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <DeleteIcon />
          </IconButton>

          <IconButton
            aria-label="send"
            onClick={() => handleClickUpdate(index)}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <SendIcon />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Assignment;
