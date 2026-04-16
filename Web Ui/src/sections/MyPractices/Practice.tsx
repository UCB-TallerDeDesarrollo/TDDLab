import React, { useState } from "react";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditPracticeForm from "./EditPracticeForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltipPractice } from "../Shared/statusHelpers";
import { GenericCard } from "../Shared/Components/GenericList";

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
    <GenericCard
      title={practice.title}
      onHover={(hovered) => handleRowHover(hovered ? index : null)}
      onClick={() => handleClickDetail(index)}
      actions={
        <>
          <Tooltip title="Ver practica" arrow>
            <IconButton
              aria-label="see"
              onClick={(e) => { e.stopPropagation(); handleClickDetail(index); }}
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
              <IconButton aria-label="edit" onClick={(e) => { e.stopPropagation(); handleEditClick(); }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Eliminar practica" arrow>
            <IconButton
              aria-label="delete"
              onClick={(e) => { e.stopPropagation(); handleClickDelete(index); }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>        
            <IconButton aria-label="status">
              {statusIcon}
            </IconButton>
          </Tooltip>
        </>
      }
    />
  );
};

export default Practice;
