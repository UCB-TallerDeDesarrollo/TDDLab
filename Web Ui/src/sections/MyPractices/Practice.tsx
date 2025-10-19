import React, { useState } from "react";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditPracticeForm from "./EditPracticeForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltipPractice } from "../Shared/statusHelpers";

interface PracticeProps {
  practice: PracticeDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleRowHover: (index: number | null) => void;
}

const Practice: React.FC<PracticeProps> = ({
  practice,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
}) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };
  const statusIcon = getStatusIcon(practice.state);

  return (
    <TableRow
      key={practice.id}
      sx={{
        borderBottom: "2px solid #E7E7E7",
      }}
    >
      <TableCell
        sx={{
          fontSize: "16px",
          padding: "16px",
          verticalAlign: "middle",
          maxWidth: "600px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {practice.title}
      </TableCell>
      
        <TableCell
      sx={{
        padding: "16px",
        verticalAlign: "middle",
        width: "240px", // Fija el ancho
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "20px",
        }}
      >
          <Tooltip title="Ver practica" arrow>
            <IconButton
              aria-label="see"
              onClick={() => handleClickDetail(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {isEditFormOpen ? (
            <EditPracticeForm
              practiceId={practice.id}
              currentTitle={practice.title}
              currentDescription={practice.description}
              onClose={handleCloseEditForm}
            />
          ) : (
            <Tooltip title="Editar practica" arrow>
              <IconButton aria-label="edit" onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Eliminar practica" arrow>
            <IconButton
              aria-label="delete"
              onClick={() => handleClickDelete(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>
            <IconButton
              aria-label="status"
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              {statusIcon}
            </IconButton>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Practice;
