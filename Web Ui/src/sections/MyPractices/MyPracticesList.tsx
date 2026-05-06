import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import { AppIcon } from "../../sections/Shared/Components/AppIcon";
import { APP_ICONS } from "../../utils/IconLibrary";
import { DeletePractice } from "../../modules/Practices/application/DeletePractice";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import Practice from "./Practice";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import "../../App.css";

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
}

function Practices({ ShowForm: showForm }: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);

  const practicesRepository = new PracticesRepository();
  const deletePractice = new DeletePractice(practicesRepository);

  const orderPractices = (practicesArray: PracticeDataObject[], sorting: string) => {
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

  const fetchData = async () => {
    try {
      const data = await practicesRepository.getPracticeByUserId(authData.userid);
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
    navigate(`/mis-practicas/${filteredPractices[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    // Map filtered index back to main array index
    const practice = filteredPractices[index];
    const mainIndex = practices.findIndex((p) => p.id === practice.id);
    setSelectedPracticeIndex(mainIndex);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedPracticeIndex !== null && practices[selectedPracticeIndex]) {
        await deletePractice.DeletePractice(practices[selectedPracticeIndex].id);
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

  const filteredPractices = practices.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <section className="page-content">
        <div className="page-header">
          <div className="page-title">
            <span>Mis Prácticas</span>
          </div>

          <div className="page-title-line" />

          <div className="page-search">
            <span>Buscar</span>
            <input
              type="text"
              aria-label="Buscar práctica"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AppIcon icon={APP_ICONS.SEARCH} size={16} />
          </div>
        </div>

        <div className="page-toolbar">
          <Button
            className="btn-std btn-primary"
            startIcon={<AppIcon icon={APP_ICONS.PLUS} size={16} />}
            onClick={showForm}
          >
            Crear
          </Button>

          <div className="page-filter-actions">
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleOrderPractices}
            />
          </div>
        </div>

        <Table className="styled-table">
          <TableBody>
            {filteredPractices.map((practice, index) => (
              <Practice
                key={practice.id}
                practice={practice}
                index={index}
                handleClickDetail={handleClickDetail}
                handleClickDelete={handleClickDelete}
                handleRowHover={handleRowHover}
              />
            ))}
          </TableBody>
        </Table>

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
