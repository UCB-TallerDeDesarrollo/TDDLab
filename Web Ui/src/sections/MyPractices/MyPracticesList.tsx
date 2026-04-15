import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import {
  Container,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DeletePractice } from "../../modules/Practices/application/DeletePractice";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import Practice from "./Practice";
import "../Groups/GroupsPage.css";

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
}

function Practices({ ShowForm: showForm }: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const practicesRepository = new PracticesRepository();
  const deletePractice = new DeletePractice(practicesRepository);

  const orderPractices = (
    practicesArray: PracticeDataObject[],
    sorting: string
  ) => {
    if (practicesArray.length > 0) {
      const sortedPractices = [...practicesArray].sort((a, b) => {
        switch (sorting) {
          case "A_Up_Order":
            return a.title.localeCompare(b.title);
          case "A_Down_Order":
            return b.title.localeCompare(a.title);
          case "Time_Up":
            return b.id - a.id;
          case "Time_Down":
            return a.id - b.id;
          default:
            return 0;
        }
      });
      setPractices(sortedPractices);
    }
  };
  // Obtener prácticas

  const fetchData = async () => {
    try {
      const data = await practicesRepository.getPracticeByUserId(
        authData.userid
      );
      setPractices(data);
      orderPractices(data, selectedSorting);
    } catch (error) {
      console.error("Error fetching practices:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSorting, authData]);

  const handleOrderPractices = (event: { target: { value: string } }) => {
    const sorting = event.target.value;
    setSelectedSorting(sorting);
    orderPractices(practices, sorting);
  };

  const handleClickDetail = (index: number) => {
    navigate(`/mis-practicas/${practices[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    setSelectedPracticeIndex(index);
    setConfirmationOpen(true);
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

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };
  return (
    <Container>
      <section className="Practicas">
        {/* ── Header ─────────────────────────────── */}
        <div className="groups-header">
          <h2 className="groups-header-title">Practicas</h2>
          <div className="groups-header-actions">
            <Button
              variant="outlined"
              className="groups-filter-btn"
              endIcon={<FilterListIcon />}
              onClick={(e) => setFilterAnchor(e.currentTarget)}
            >
              Filtrar
            </Button>
            <Menu
              anchorEl={filterAnchor}
              open={Boolean(filterAnchor)}
              onClose={() => setFilterAnchor(null)}
            >
              <MenuItem onClick={() => { handleOrderPractices({ target: { value: "A_Up_Order" } }); setFilterAnchor(null); }}>
                Orden alfabetico ascendente
              </MenuItem>
              <MenuItem onClick={() => { handleOrderPractices({ target: { value: "A_Down_Order" } }); setFilterAnchor(null); }}>
                Orden alfabetico descendente
              </MenuItem>
              <MenuItem onClick={() => { handleOrderPractices({ target: { value: "Time_Up" } }); setFilterAnchor(null); }}>
                Recientes
              </MenuItem>
              <MenuItem onClick={() => { handleOrderPractices({ target: { value: "Time_Down" } }); setFilterAnchor(null); }}>
                Antiguos
              </MenuItem>
            </Menu>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              className="groups-create-btn"
              onClick={showForm}
            >
              Crear
            </Button>
          </div>
        </div>

        <hr className="groups-divider" />

        {/* ── Card list ──────────────────────────── */}
        <div className="groups-card-list">
          {practices.map((practice, index) => (
            <Practice
              key={practice.id}
              practice={practice}
              index={index}
              handleClickDetail={handleClickDetail}
              handleClickDelete={handleClickDelete}
              handleRowHover={handleRowHover}
            />
          ))}
        </div>

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
    </Container>
  );
}

export default Practices;
