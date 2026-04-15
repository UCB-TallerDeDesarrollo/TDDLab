import React, { useState } from "react";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditPracticeForm from "./EditPracticeForm";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
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
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 2, sm: 3 },
        pl: { xs: 1.6, sm: 2.25, md: 2.5 },
        pr: { xs: 1.25, sm: 1.75, md: 2 },
        py: { xs: 1.2, sm: 1.45, md: 1.7 },
        border: "1px solid #d5dbe1",
        borderRadius: 0,
        backgroundColor: "#ffffff",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Typography
        sx={{
          color: "#131313",
          fontSize: { xs: "0.82rem", sm: "0.98rem", md: "1.02rem" },
          fontWeight: 400,
          lineHeight: 1.25,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {practice.title}
      </Typography>

      <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "flex-end", sm: "flex-end" },
        alignItems: "center",
        gap: { xs: 0.5, sm: 0.85 },
        width: { xs: "100%", sm: "auto" },
        flexWrap: "wrap",
      }}
    >
          <Tooltip title="Ver practica" arrow>
            <IconButton
              aria-label="see"
              onClick={() => handleClickDetail(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
              sx={{
                color: "#050505",
                p: 0.75,
              }}
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
              <IconButton
                aria-label="edit"
                onClick={handleEditClick}
                sx={{
                  color: "#050505",
                  p: 0.75,
                }}
              >
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
              sx={{
                color: "#050505",
                p: 0.75,
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={getStatusTooltipPractice(practice.state)} arrow>
            <IconButton
              aria-label="status"
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
              sx={{
                color: "#050505",
                p: 0.75,
              }}
            >
              {statusIcon}
            </IconButton>
          </Tooltip>
      </Box>
    </Box>
  );
};

export default Practice;
