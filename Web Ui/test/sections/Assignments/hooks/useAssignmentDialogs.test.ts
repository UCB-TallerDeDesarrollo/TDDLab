import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAssignmentDialogs } from "../../../src/sections/Assignments/hooks/useAssignmentDialogs";

describe("useAssignmentDialogs", () => {
  describe("initial state", () => {
    it("debería inicializar con ambos diálogos cerrados", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      expect(result.current.linkDialogOpen).toBe(false);
      expect(result.current.isCommentDialogOpen).toBe(false);
    });
  });

  describe("link dialog", () => {
    it("debería abrir el link dialog con handleOpenLinkDialog", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleOpenLinkDialog();
      });

      expect(result.current.linkDialogOpen).toBe(true);
    });

    it("debería cerrar el link dialog con handleCloseLinkDialog", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleOpenLinkDialog();
      });
      expect(result.current.linkDialogOpen).toBe(true);

      act(() => {
        result.current.handleCloseLinkDialog();
      });
      expect(result.current.linkDialogOpen).toBe(false);
    });

    it("debería cerrar el link dialog aunque no esté abierto", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleCloseLinkDialog();
      });

      expect(result.current.linkDialogOpen).toBe(false);
    });
  });

  describe("comment dialog", () => {
    it("debería abrir el comment dialog con handleOpenCommentDialog", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleOpenCommentDialog();
      });

      expect(result.current.isCommentDialogOpen).toBe(true);
    });

    it("debería cerrar el comment dialog con handleCloseCommentDialog", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleOpenCommentDialog();
      });
      expect(result.current.isCommentDialogOpen).toBe(true);

      act(() => {
        result.current.handleCloseCommentDialog();
      });
      expect(result.current.isCommentDialogOpen).toBe(false);
    });

    it("debería cerrar el comment dialog aunque no esté abierto", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleCloseCommentDialog();
      });

      expect(result.current.isCommentDialogOpen).toBe(false);
    });
  });

  describe("múltiples acciones", () => {
    it("debería manejar apertura y cierre independiente de ambos diálogos", () => {
      const { result } = renderHook(() => useAssignmentDialogs());

      act(() => {
        result.current.handleOpenLinkDialog();
      });
      expect(result.current.linkDialogOpen).toBe(true);
      expect(result.current.isCommentDialogOpen).toBe(false);

      act(() => {
        result.current.handleOpenCommentDialog();
      });
      expect(result.current.linkDialogOpen).toBe(true);
      expect(result.current.isCommentDialogOpen).toBe(true);

      act(() => {
        result.current.handleCloseLinkDialog();
      });
      expect(result.current.linkDialogOpen).toBe(false);
      expect(result.current.isCommentDialogOpen).toBe(true);
    });
  });
});
