import { useState } from "react";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import {
  getStatusIcon,
  getStatusTooltipPractice,
} from "../../../shared/helpers/statusHelpers";
import EditPracticeForm from "./EditPracticeForm";
import { PracticeListItemViewModel } from "../types/myPracticesScreen";
import AnimatedIcon from "../../../shared/components/AnimatedIcon";

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
          <AnimatedIcon
            title="Ver practica"
            actionType="view"
            aria-label="see"
            onClick={() => onOpenDetail(practice.id)}
            icon={<VisibilityIcon />}
          />
          {isEditFormOpen && canManagePractices ? (
            <EditPracticeForm
              currentPractice={currentPractice}
              onClose={handleCloseEditForm}
              onPracticeUpdated={onPracticeUpdated}
            />
          ) : null}
          <AnimatedIcon
            title={
              canManagePractices
                ? "Editar practica"
                : "Sin permisos para editar"
            }
            actionType="edit"
            aria-label="edit"
            onClick={handleEditClick}
            disabled={!canManagePractices}
            icon={<EditIcon />}
          />
          <AnimatedIcon
            title={
              canManagePractices
                ? "Eliminar practica"
                : "Sin permisos para eliminar"
            }
            actionType="delete"
            aria-label="delete"
            onClick={() => onDeletePractice(practice.id)}
            disabled={!canManagePractices}
            icon={<DeleteIcon />}
          />

          <AnimatedIcon
            title={getStatusTooltipPractice(practice.state)}
            actionType="default"
            aria-label="status"
            icon={statusIcon}
          />
      </ActionsContainer>
    </RowContainer>
  );
}
