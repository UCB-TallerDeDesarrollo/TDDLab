import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import { SelectChangeEvent } from "@mui/material";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import { DeletePractice } from "../../modules/Practices/application/DeletePractice";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import EditPracticeForm from "./EditPracticeForm";
import CreateButton from "../GeneralPurposeComponents/CreateButton";
import ActionSelect from "../GeneralPurposeComponents/ActionSelect";
import { TableView, type TableViewColumn } from "../Shared/Components/TableView";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon } from "../Shared/statusHelpers";

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
}

function Practices({ ShowForm: showForm }: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<number | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedPracticeForEdit, setSelectedPracticeForEdit] = useState<PracticeDataObject | null>(null);

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const navigate = useNavigate();

  const practicesRepository = new PracticesRepository();
  const deletePractice = new DeletePractice(practicesRepository);

  const columns: TableViewColumn<PracticeDataObject>[] = [
    {
      id: "title",
      header: "Título",
      renderCell: (practice) => practice.title,
      cellSx: {
        fontSize: "16px",
        padding: "12px 16px",
        verticalAlign: "middle",
        maxWidth: "120px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
    {
      id: "description",
      header: "Descripción",
      renderCell: (practice) => practice.description,
      cellSx: {
        fontSize: "16px",
        padding: "12px 16px",
        verticalAlign: "middle",
      },
    },
    {
      id: "creation_date",
      header: "Fecha de Creación",
      renderCell: (practice) => new Date(practice.creation_date).toLocaleDateString(),
      cellSx: {
        fontSize: "16px",
        padding: "12px 16px",
        verticalAlign: "middle",
      },
    },
    {
      id: "state",
      header: "Estado",
      renderCell: (practice) => getStatusIcon(practice.state),
      cellSx: {
        padding: "12px 16px",
        verticalAlign: "middle",
      },
    },
    {
      id: "actions",
      header: "Acciones",
      renderCell: (_practice, index) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Tooltip title="Ver práctica" arrow>
            <IconButton
              aria-label="see"
              onClick={() => handleClickDetail(index)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar práctica" arrow>
            <IconButton
              aria-label="edit"
              onClick={() => handleClickEdit(index)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar práctica" arrow>
            <IconButton
              aria-label="delete"
              onClick={() => handleClickDelete(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
      cellSx: {
        padding: "12px 16px",
        verticalAlign: "middle",
        width: "200px",
      },
    },
  ];

  const fetchData = async () => {
    try {
      const data = await practicesRepository.getPracticeByUserId(
        authData.userid
      );
      setPractices(data);
    } catch (error) {
      console.error("Error fetching practices:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authData]);

  const handleClickDetail = (index: number) => {
    navigate(`/mis-practicas/${practices[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    setSelectedPracticeIndex(index);
    setConfirmationOpen(true);
  };

  const handleClickEdit = (index: number) => {
    setSelectedPracticeForEdit(practices[index]);
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setSelectedPracticeForEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedPracticeIndex !== null && practices[selectedPracticeIndex]) {
        await deletePractice.DeletePractice(
          practices[selectedPracticeIndex].id
        );

        const updatedPractices = [...practices];
        updatedPractices.splice(selectedPracticeIndex, 1);
        setPractices(updatedPractices);
      }
      setConfirmationOpen(false);
    } catch (error) {
      console.error(error);
    }

    setValidationDialogOpen(true);
    setConfirmationOpen(false);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setSelectedFilter(event.target.value);
  };

  const filterOptions = [
    { value: "", label: "Filtrar" },
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendientes" },
    { value: "completed", label: "Completadas" },
  ];

  return (
    <div style={{ width: "80%", maxWidth: "960px", padding: "0 16px", margin: "0 auto" }}>
      <section className="Practicas" style={{ width: "100%", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingTop: "6px",
            borderBottom: "1px solid #D1D5DB",
            paddingBottom: "16px",
            width: "100%",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: "24px" }}>
            Practicas
          </h2>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <ActionSelect
              value={selectedFilter}
              onChange={handleFilterChange}
              options={filterOptions}
              minWidth="120px"
            />

            <CreateButton
              onClick={showForm}
              label="Crear +"
              minWidth="100px"
            />
          </div>
        </div>

        <TableView
          columns={columns}
          rows={practices}
          getRowKey={(practice) => practice.id}
          tableSx={{ width: "100%", marginLeft: "0", marginRight: "0" }}
          bodyRowSx={{
            borderBottom: "1px solid #E5E7EB",
            height: "60px",
            minHeight: "60px",
            boxSizing: "border-box",
          }}
          onRowMouseEnter={(_, index) => setHoveredRow(index)}
          onRowMouseLeave={() => setHoveredRow(null)}
          getBodyRowSx={(_, index) => ({
            backgroundColor: _hoveredRow === index ? "#EBF5FF" : "white",
            transition: "background-color 0.2s",
          })}
        />

        {isEditFormOpen && selectedPracticeForEdit && (
          <EditPracticeForm
            practiceId={selectedPracticeForEdit.id}
            currentTitle={selectedPracticeForEdit.title}
            currentDescription={selectedPracticeForEdit.description}
            onClose={handleCloseEditForm}
          />
        )}

        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la practica?"
            content="Ten en cuenta que esta acción también eliminará todas las entregas asociadas."
            cancelText="Cancelar"
            deleteText="Eliminar"
            onCancel={() => setConfirmationOpen(false)}
            onDelete={handleConfirmDelete}
          />
        )}

        {validationDialogOpen && (
          <ValidationDialog
            open={validationDialogOpen}
            title="Practica eliminada exitosamente"
            closeText="Cerrar"
            onClose={() => window.location.reload()}
          />
        )}
      </section>
    </div>
  );
}

export default Practices;