import React, { useState } from "react";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import EditPracticeForm from "./EditPracticeForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltipPractice } from "../Shared/statusHelpers";
import "../../App.css";
import { AppIcon } from "../../sections/Shared/Components/AppIcon"; // O la ruta que elijas
import { APP_ICONS } from "../../utils/IconLibrary";
import IconButton from "@mui/material/IconButton";

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
    <TableRow className="table-row-bordered">
      <TableCell className="practice-title-cell">
        {practice.title}
      </TableCell>
      
      <TableCell align="right">
        <div className="action-buttons-group">
          
          {/* BOTÓN VER */}
          <Tooltip title="Ver practica" arrow>
            <IconButton
              aria-label="see"
              onClick={() => handleClickDetail(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              {/* Cambiado de PLUS a VIEW para que tenga sentido */}
              <AppIcon icon={APP_ICONS.VIEW} className="icon-gray" />
            </IconButton>
          </Tooltip>

          {/* BOTÓN EDITAR */}
          {isEditFormOpen ? (
            <EditPracticeForm
              practiceId={practice.id}
              currentTitle={practice.title}
              currentDescription={practice.description}
              onClose={handleCloseEditForm}
            />
          ) : (
            <Tooltip title="Editar practica" arrow>
              <IconButton onClick={handleEditClick}>
                <AppIcon icon={APP_ICONS.EDIT} size={20} className="icon-gray" />
              </IconButton>
            </Tooltip>
          )}

          {/* BOTÓN ELIMINAR */}
          <Tooltip title="Eliminar practica" arrow>
            <IconButton
              aria-label="delete"
              onClick={() => handleClickDelete(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <AppIcon icon={APP_ICONS.DELETE} className="icon-gray" />
            </IconButton>
          </Tooltip>

          {/* ESTADO */}
          <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>
            <IconButton
              aria-label="status"
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              {/* Aquí podrías también estandarizar statusIcon si lo deseas más adelante */}
              {statusIcon}
            </IconButton>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Practice;