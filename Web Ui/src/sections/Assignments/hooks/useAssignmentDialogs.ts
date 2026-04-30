import { useState } from "react";

export const useAssignmentDialogs = () => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  return {
    linkDialogOpen,
    isCommentDialogOpen,
    handleOpenLinkDialog,
    handleCloseLinkDialog,
    handleOpenCommentDialog,
    handleCloseCommentDialog,
  };
};
