import { useState } from "react";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

  onPracticeUpdated: (
    practice: PracticeDataObject
  ) => Promise<void>;

  onStartPractice: (
    practice: PracticeDataObject
  ) => Promise<void>;

  onFinishPractice: (
    practice: PracticeDataObject
  ) => Promise<void>;
}


const RowContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 75,
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
    minHeight: 75,
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


const StatusText = styled(Typography)<{
  status: string;
}>(({ status }) => ({
  fontSize: 13,
  fontWeight: 600,

  color:
    status === "in_progress"
      ? "#1976D2"
      : status === "finished"
        ? "#2E7D32"
        : "#757575",
}));


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
  onStartPractice,
  onFinishPractice,
}: Readonly<PracticeRowProps>) {


  const [isEditFormOpen, setIsEditFormOpen] =
    useState(false);



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



  const handleStartPractice = async () => {

    await onStartPractice({
      ...currentPractice,
      state: "in_progress",
    });

  };



  const handleFinishPractice = async () => {

    await onFinishPractice({
      ...currentPractice,
      state: "finished",
    });

  };

  const statusIcon =
    getStatusIcon(practice.state);

  const getStatusLabel = () => {

    if (practice.state === "pending") {
      return "Pendiente";
    }

    if (practice.state === "in_progress") {
      return "En progreso";
    }

    if (practice.state === "finished") {
      return "Finalizada";
    }

    return practice.state;

  };

  return (

    <RowContainer key={practice.id}>

      <Box>

        <RowTitle>
          {practice.title}
        </RowTitle>

        <StatusText status={practice.state}>

          Estado: {getStatusLabel()}

        </StatusText>

      </Box>

      <ActionsContainer>

        <AnimatedIcon

          title="Ver practica"

          actionType="view"

          aria-label="see"

          onClick={() =>
            onOpenDetail(practice.id)
          }

          icon={<VisibilityIcon />}

        />

        {
          practice.state === "pending" ? (

            <AnimatedIcon

              title="Iniciar práctica"

              actionType="default"

              aria-label="start-practice"

              onClick={handleStartPractice}

              icon={<PlayArrowIcon />}

            />

          ) : null
        }

        {
          practice.state === "in_progress" ? (

            <AnimatedIcon

              title="Terminar práctica"

              actionType="default"

              aria-label="finish-practice"

              onClick={handleFinishPractice}

              icon={<CheckCircleIcon />}

            />

          ) : null
        }

        {
          isEditFormOpen &&
          canManagePractices ? (

            <EditPracticeForm

              currentPractice={currentPractice}

              onClose={handleCloseEditForm}

              onPracticeUpdated={onPracticeUpdated}

            />

          ) : null
        }

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

          onClick={() =>
            onDeletePractice(practice.id)
          }

          disabled={!canManagePractices}

          icon={<DeleteIcon />}

        />

        <AnimatedIcon

          title={
            practice.state === "pending"
              ? "Pendiente"
              : getStatusTooltipPractice(
                  practice.state
                )
          }

          actionType="default"

          aria-label="status"

          icon={statusIcon}

        />

      </ActionsContainer>

    </RowContainer>

  );
}