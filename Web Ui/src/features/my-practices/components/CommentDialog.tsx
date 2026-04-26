import React from "react";
import { CommentDialog as SharedCommentDialog } from "../../../sections/Shared/Components/CommentDialog";

interface CommentDialogProps {
  open: boolean;
  link?: string;
  onSend: (comment: string, link: string) => Promise<void> | void;
  onClose: () => void;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  link,
  onClose,
  onSend,
}) => (
  <SharedCommentDialog
    open={open}
    link={link}
    onClose={onClose}
    onSend={onSend}
  />
);
