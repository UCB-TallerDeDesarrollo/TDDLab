import { useCallback, useMemo, useState } from "react";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import { myPracticesService, orderPractices } from "../services/myPractices.service";
import { CreatePracticeInput, MyPracticesSortOption, MyPracticesViewState } from "../types/myPractices.types";

const DEFAULT_ERROR = "No pudimos cargar tus practicas. Intenta nuevamente.";

const canManagePractices = (role: string): boolean =>
  role === "admin" || role === "teacher" || role === "student";
const canCreatePractices = (role: string): boolean =>
  role === "admin" || role === "teacher" || role === "student";

export const useMyPractices = (userid: number, userRole: string) => {
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);
  const [selectedSorting, setSelectedSorting] = useState<MyPracticesSortOption>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    [loadPractices]
  );

  const deletePractice = useCallback(
    async (practiceId: number) => {
      setIsSaving(true);
      try {
        await myPracticesService.delete(practiceId);
        setPractices((current) => current.filter((practice) => practice.id !== practiceId));
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updatePractice = useCallback(
    async (updatedPractice: PracticeDataObject) => {
      setIsSaving(true);
      try {
        await myPracticesService.update(updatedPractice.id, updatedPractice);
        setPractices((current) => {
          const next = current.map((practice) =>
            practice.id === updatedPractice.id ? updatedPractice : practice
          );
          return orderPractices(next, selectedSorting);
        });
      } finally {
        setIsSaving(false);
      }
    },
    [selectedSorting]
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
  }, [isLoading, error, practices.length]);

  return {
    practices,
    selectedSorting,
    isLoading,
    isSaving,
    error,
    viewState,
    canManagePractices: canManagePractices(userRole),
    canCreatePractices: canCreatePractices(userRole),
    loadPractices,
    changeSorting,
    createPractice,
    deletePractice,
    updatePractice,
  };
};
