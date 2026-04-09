import { ValidationDialog } from "../../../sections/Shared/Components/ValidationDialog";

interface UsersFeedbackDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
}

function UsersFeedbackDialog({
  open,
  title,
  onClose,
}: UsersFeedbackDialogProps) {
  return (
    <ValidationDialog
      open={open}
      title={title}
      closeText="Cerrar"
      onClose={onClose}
    />
  );
}

export default UsersFeedbackDialog;