import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import {
  getStatusIcon,
  getStatusTooltipPractice,
} from "../../../shared/helpers/statusHelpers";
import EditPracticeForm from "./EditPracticeForm";
import { PracticeListItemViewModel } from "../types/myPracticesScreen";

interface PracticeRowProps {
  practice: PracticeListItemViewModel;
  canManagePractices: boolean;
  onOpenDetail: (practiceId: number) => void;
  onDeletePractice: (practiceId: number) => void;
  onPracticeUpdated: (practice: PracticeDataObject) => Promise<void>;
}

export default function PracticeRow({
  practice,
  canManagePractices,
  onOpenDetail,
  onDeletePractice,
  onPracticeUpdated,
}: Readonly<PracticeRowProps>) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const currentPractice: PracticeDataObject = {
    id: practice.id,
    title: practice.title,
    description: practice.description,
    state: practice.state,
    creation_date: practice.creationDate,
    userid: practice.userid,
  };

  const handleEditClick = () => {
    if (!canManagePractices) {
      return;
    }
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };

  const statusIcon = getStatusIcon(practice.state);

  return (
    <TableRow key={practice.id}>
      <TableCell
        sx={{
          fontSize: "20px",
          fontWeight: 400,
          border: "0.5px solid #898989",
          borderRight: "none",
          borderRadius: "5px",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          height: "69px",
          padding: "10px 16px",
          verticalAlign: "middle",
          width: "auto",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {practice.title}
      </TableCell>
      <TableCell
        sx={{
          border: "0.5px solid #898989",
          borderLeft: "none",
          borderRadius: "5px",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          height: "69px",
          padding: { xs: "10px 8px", sm: "10px 16px" },
          verticalAlign: "middle",
          width: { xs: "188px", sm: "230px", md: "280px" },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Tooltip title="Ver practica" arrow>
            <IconButton
              aria-label="see"
              onClick={() => onOpenDetail(practice.id)}
              sx={{ color: "#002346" }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {isEditFormOpen && canManagePractices ? (
            <EditPracticeForm
              currentPractice={currentPractice}
              onClose={handleCloseEditForm}
              onPracticeUpdated={onPracticeUpdated}
            />
          ) : null}
          <Tooltip
            title={
              canManagePractices
                ? "Editar practica"
                : "Sin permisos para editar"
            }
            arrow
          >
            <span>
              <IconButton
                aria-label="edit"
                onClick={handleEditClick}
                disabled={!canManagePractices}
                sx={{ color: "#002346" }}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={
              canManagePractices
                ? "Eliminar practica"
                : "Sin permisos para eliminar"
            }
            arrow
          >
            <span>
              <IconButton
                aria-label="delete"
                onClick={() => onDeletePractice(practice.id)}
                disabled={!canManagePractices}
                sx={{ color: "#002346" }}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>
            <IconButton aria-label="status" sx={{ color: "#002346" }}>
              {statusIcon}
            </IconButton>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
