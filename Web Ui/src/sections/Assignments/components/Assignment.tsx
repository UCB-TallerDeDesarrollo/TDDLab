import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import React, { useState, useEffect } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAssignmentForm from "./EditAssignmentForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltip } from "../../Shared/statusHelpers";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository"
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
    <TableRow 
    key={assignment.id}
    sx={{ 
      borderBottom: "2px solid #E7E7E7" 
    }}>
      <TableCell
        style={{
          width: "20%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {assignment.title}
      </TableCell>
      <TableCell style={{ width: "30%", maxWidth: "300px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "nowrap",
            }}
          >
          <Tooltip title="Ver tarea" arrow>
            <IconButton
              aria-label="see"
              onClick={() => handleClickDetail(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {isAdmin(role) && isEditFormOpen ? (
            <EditAssignmentForm
              assignmentId={assignment.id}
              currentGroupName={groupName}
              currentTitle={assignment.title}
              currentDescription={assignment.description}
              //currentGroupId={}
              onClose={handleCloseEditForm}
            />
          ) : (
            isAdmin(role) && (
              <Tooltip title="Editar tarea" arrow>
                <IconButton aria-label="edit" onClick={handleEditClick}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )
          )}

          {isAdmin(role) && (
            <Tooltip title="Eliminar tarea" arrow>
              <IconButton
                aria-label="delete"
                onClick={() => handleClickDelete(index)}
                onMouseEnter={() => handleRowHover(index)}
                onMouseLeave={() => handleRowHover(null)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={getStatusTooltip(assignment.state)} arrow>
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

export default Assignment;
