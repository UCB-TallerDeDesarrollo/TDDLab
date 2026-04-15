import { useState } from "react";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
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

const RowContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 69,
  border: "0.5px solid #898989",
  borderRadius: 5,
  backgroundColor: "#FFFFFF",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: "#F0F4F8",
  },
  padding: theme.spacing(1.625, 2.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  boxSizing: "border-box",
  [theme.breakpoints.down("md")]: {
    height: "auto",
    minHeight: 69,
    alignItems: "flex-start",
    flexDirection: "column",
  },
}));

const RowTitle = styled(Typography)({
  color: "#000000",
  fontSize: 20,
  fontWeight: 400,
  lineHeight: "24px",
  fontFamily: '"Inter", sans-serif',
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

const ActionIcon = styled(IconButton)({
  width: 40,
  height: 40,
  borderRadius: "50%",
  color: "#002346",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 35, 70, 0.08)",
  },
});

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
    <RowContainer key={practice.id}>
      <RowTitle>{practice.title}</RowTitle>
      <ActionsContainer>
          <Tooltip title="Ver practica" arrow>
            <ActionIcon
              aria-label="see"
              onClick={() => onOpenDetail(practice.id)}
            >
              <VisibilityIcon />
            </ActionIcon>
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
              <ActionIcon
                aria-label="edit"
                onClick={handleEditClick}
                disabled={!canManagePractices}
              >
                <EditIcon />
              </ActionIcon>
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
              <ActionIcon
                aria-label="delete"
                onClick={() => onDeletePractice(practice.id)}
                disabled={!canManagePractices}
              >
                <DeleteIcon />
              </ActionIcon>
            </span>
          </Tooltip>

          <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>
            <ActionIcon aria-label="status">
              {statusIcon}
            </ActionIcon>
          </Tooltip>
      </ActionsContainer>
    </RowContainer>
  );
}
