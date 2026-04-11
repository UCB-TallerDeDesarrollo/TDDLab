import { ConfirmationDialog } from "./ConfirmationDialog";

interface RemoveUserDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function RemoveUserDialog({
  open,
  onCancel,
  onConfirm,
}: RemoveUserDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Confirmar eliminación"
      content="¿Estás seguro que deseas eliminar del grupo a este estudiante?"
      cancelText="Cancelar"
      deleteText="Eliminar"
      onCancel={onCancel}
      onDelete={onConfirm}
    />
  );
}

export default RemoveUserDialog;
