import React, { useState } from "react";
import { Box, Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import { IconifyIcon } from "../Shared/Components";
import { getStatusIcon, getStatusTooltipPractice } from "../Shared/statusHelpers";
import EditPracticeForm from "./EditPracticeForm";
import practiceCardStyles from "./PracticeCard.styles";

interface PracticeCardProps {
  practice: PracticeDataObject;
  index: number;
  onClickDetail: (index: number) => void;
  onClickDelete: (index: number) => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  index,
  onClickDetail,
  onClickDelete,
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
    <>
      <Card
        sx={practiceCardStyles.container}
      >
        <CardContent sx={practiceCardStyles.cardContent}>
          {/* Título y contenido */}
          <Box sx={practiceCardStyles.titleDescriptionBox}>
            <Box component="div" sx={practiceCardStyles.title}>
              {practice.title}
            </Box>
            <Box component="div" sx={practiceCardStyles.description}>
              {practice.description}
            </Box>
          </Box>

          {/* Acciones al pie de la tarjeta */}
          <Box sx={practiceCardStyles.actionsContainer}>
            <Tooltip title="Ver practica" arrow>
              <IconButton
                size="small"
                onClick={() => onClickDetail(index)}
                sx={practiceCardStyles.actionButton}
              >
                <IconifyIcon
                  icon="mdi:eye"
                  color="primary"
                  hoverColor="#1565c0"
                  width={20}
                  height={20}
                />
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
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  sx={practiceCardStyles.actionButton}
                >
                  <IconifyIcon
                    icon="mdi:pencil"
                    color="primary"
                    hoverColor="#1565c0"
                    width={20}
                    height={20}
                  />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Eliminar practica" arrow>
              <IconButton
                size="small"
                onClick={() => onClickDelete(index)}
                sx={practiceCardStyles.actionButtonDelete}
              >
                <IconifyIcon
                  icon="mdi:trash-can"
                  color="error"
                  hoverColor="#d32f2f"
                  width={20}
                  height={20}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>
              <IconButton
                size="small"
                sx={practiceCardStyles.actionButtonStatus}
              >
                {statusIcon}
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default PracticeCard;
