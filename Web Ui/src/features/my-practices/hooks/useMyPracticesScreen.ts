import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import {
  myPracticesService,
  orderPractices,
  resolveMyPracticesPermissions,
  toPracticeListItems,
} from "../services/myPracticesScreenService";
import {
  CreatePracticeInput,
  MyPracticesSortOption,
  MyPracticesViewState,
} from "../types/myPracticesScreen";

const DEFAULT_ERROR = "No pudimos cargar tus practicas. Intenta nuevamente.";

export const useMyPracticesScreen = (userid: number, userRole: string) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] =
    useState<MyPracticesSortOption>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const loadPractices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await myPracticesService.getByUserId(userid);
      setPractices(orderPractices(data, selectedSorting));
    } catch (loadError) {
      console.error(loadError);
      setError(DEFAULT_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [userid, selectedSorting]);

  const changeSorting = useCallback((sorting: MyPracticesSortOption) => {
    setSelectedSorting(sorting);
    setPractices((current) => orderPractices(current, sorting));
  }, []);

  const openCreateForm = useCallback(() => {
    setIsCreateFormOpen(true);
  }, []);

  const closeCreateForm = useCallback(() => {
    setIsCreateFormOpen(false);
  }, []);

  const openPracticeDetail = useCallback(
    (practiceId: number) => {
      navigate(`/mis-practicas/${practiceId}`);
    },
    [navigate],
  );

  const createPractice = useCallback(
    async (input: CreatePracticeInput) => {
      setIsSaving(true);
      try {
        await myPracticesService.create(input);
        await loadPractices();
      } finally {
        setIsSaving(false);
      }
    },
    [loadPractices],
  );

  const deletePractice = useCallback(async (practiceId: number) => {
    setIsSaving(true);
    try {
      await myPracticesService.delete(practiceId);
      setPractices((current) =>
        current.filter((practice) => practice.id !== practiceId),
      );
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updatePractice = useCallback(
    async (updatedPractice: PracticeDataObject) => {
      setIsSaving(true);
      try {
        await myPracticesService.update(updatedPractice.id, updatedPractice);
        setPractices((current) => {
          const next = current.map((practice) =>
            practice.id === updatedPractice.id ? updatedPractice : practice,
          );
          return orderPractices(next, selectedSorting);
        });
      } finally {
        setIsSaving(false);
      }
    },
    [selectedSorting],
  );

  const viewState: MyPracticesViewState = useMemo(() => {
    if (isLoading) {
      return "loading";
    }
    if (error) {
      return "error";
    }
    if (practices.length === 0) {
      return "empty";
    }
    return "success";
  }, [error, isLoading, practices.length]);

  return {
    practiceItems: toPracticeListItems(practices),
    selectedSorting,
    isLoading,
    isSaving,
    error,
    viewState,
    isCreateFormOpen,
    ...resolveMyPracticesPermissions(userRole),
    loadPractices,
    changeSorting,
    openCreateForm,
    closeCreateForm,
    openPracticeDetail,
    createPractice,
    deletePractice,
    updatePractice,
  };
};
