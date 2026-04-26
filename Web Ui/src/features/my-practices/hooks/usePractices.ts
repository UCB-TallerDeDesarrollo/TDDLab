import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { deletePractice, fetchPracticesByUserId } from "../services/practicesService";
import { PracticeDataObject, ViewState } from "../types";

export interface UsePracticesReturn {
  practices: PracticeDataObject[];
  listState: ViewState;
  selectedSorting: string;
  confirmationOpen: boolean;
  validationDialogOpen: boolean;
  createFormOpen: boolean;
  handleOrderPractices: (value: string) => void;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  handleCloseValidation: () => void;
  openCreateForm: () => void;
  closeCreateForm: () => void;
  refreshPractices: () => void;
}

function orderPracticesArray(
  arr: PracticeDataObject[],
  sorting: string
): PracticeDataObject[] {
  if (arr.length === 0) return arr;
  return [...arr].sort((a, b) => {
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
}

export function usePractices(): UsePracticesReturn {
  const [authData] = useGlobalState("authData");
  const navigate = useNavigate();

  const [practices, setPractices] = useState<PracticeDataObject[]>([]);
  const [listState, setListState] = useState<ViewState>("loading");
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState(0);

  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<number | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);

  useEffect(() => {
    if (!authData.userid || authData.userid === -1) return;

    setListState("loading");

    fetchPracticesByUserId(authData.userid)
      .then((data) => {
        const ordered = orderPracticesArray(data, selectedSorting);
        setPractices(ordered);
        setListState(ordered.length === 0 ? "empty" : "success");
      })
      .catch((err) => {
        console.error("Error fetching practices:", err);
        setListState("error");
      });
  }, [authData.userid, selectedSorting, refreshToken]);

  useEffect(() => {
    const handlePracticeUpdated = () => setRefreshToken((prev) => prev + 1);
    window.addEventListener("practice-updated", handlePracticeUpdated as EventListener);
    return () => {
      window.removeEventListener("practice-updated", handlePracticeUpdated as EventListener);
    };
  }, []);

  const handleOrderPractices = (value: string) => {
    setSelectedSorting(value);
    setPractices((prev) => orderPracticesArray(prev, value));
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
        await deletePractice(practices[selectedPracticeIndex].id);
        setPractices((prev) => {
          const updated = [...prev];
          updated.splice(selectedPracticeIndex, 1);
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
    }
    setConfirmationOpen(false);
    setValidationDialogOpen(true);
  };

  const handleCancelDelete = () => setConfirmationOpen(false);
  const handleCloseValidation = () => setValidationDialogOpen(false);

  const openCreateForm = () => setCreateFormOpen(true);
  const closeCreateForm = () => setCreateFormOpen(false);

  const refreshPractices = () => setRefreshToken((prev) => prev + 1);

  return {
    practices,
    listState,
    selectedSorting,
    confirmationOpen,
    validationDialogOpen,
    createFormOpen,
    handleOrderPractices,
    handleClickDetail,
    handleClickDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleCloseValidation,
    openCreateForm,
    closeCreateForm,
    refreshPractices,
  };
}
