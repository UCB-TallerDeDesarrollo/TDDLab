import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Tooltip, Box } from "@mui/material";
import EditAssignmentForm from "./EditAssignmentForm";
import { getStatusIcon, getStatusTooltip } from "../../Shared/statusHelpers";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { IconifyIcon } from "../../Shared/Components";
import practiceCardStyles from "../../MyPractices/PracticeCard.styles";
function isAdmin(role: string): boolean {
  return role === "admin" || role === "teacher";
}

interface AssignmentProps {
  assignment: AssignmentDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleRowHover: (index: number | null) => void;
  role: string;
}

const Assignment: React.FC<AssignmentProps> = ({
  assignment,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
  role,
  //group,
}) => {

  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    if (assignment.groupid) {
      fetchGroupName(assignment.groupid);
    }
  }, [assignment.groupid]);

  const fetchGroupName = async (groupId: number) => {
    try {
      const groupsRepository = new GroupsRepository();
      const group = await groupsRepository.getGroupById(groupId);
      if (group) {
        setGroupName(group.groupName);
      }
    } catch (error) {
      console.error("Error fetching group name:", error);
    }
  };

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };
  const statusIcon = getStatusIcon(assignment.state);

  return (
    <Card sx={practiceCardStyles.container}>
      <CardContent sx={practiceCardStyles.cardContentStacked}>
        {/* Contenedor: Título/Descripción + Acciones horizontales */}
        <Box sx={practiceCardStyles.mainContent}>
          {/* Sección de contenido (izquierda) */}
          <Box sx={practiceCardStyles.titleDescriptionBox}>
            <Box component="div" sx={practiceCardStyles.title}>
              {assignment.title}
            </Box>
            <Box component="div" sx={practiceCardStyles.descriptionStacked}>
              {assignment.description}
            </Box>
          </Box>

          {/* Sección de acciones (derecha) */}
          <Box sx={practiceCardStyles.actionsContainerStacked}>
            <Tooltip title="Ver tarea" arrow>
              <IconButton
                size="small"
                onClick={() => handleClickDetail(index)}
                onMouseEnter={() => handleRowHover(index)}
                onMouseLeave={() => handleRowHover(null)}
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

            {isAdmin(role) && isEditFormOpen ? (
              <EditAssignmentForm
                assignmentId={assignment.id}
                currentGroupName={groupName}
                currentTitle={assignment.title}
                currentDescription={assignment.description}
                onClose={handleCloseEditForm}
              />
            ) : (
              isAdmin(role) && (
                <Tooltip title="Editar tarea" arrow>
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
              )
            )}

            {isAdmin(role) && (
              <Tooltip title="Eliminar tarea" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleClickDelete(index)}
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={() => handleRowHover(null)}
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
            )}

            <Tooltip title={getStatusTooltip(assignment.state)} arrow>
              <IconButton
                size="small"
                onMouseEnter={() => handleRowHover(index)}
                onMouseLeave={() => handleRowHover(null)}
                sx={practiceCardStyles.actionButtonStatus}
              >
                {statusIcon}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Assignment;
