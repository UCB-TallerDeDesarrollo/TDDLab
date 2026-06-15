import ConfirmationDialog from "../../../shared/components/ConfirmationDialog";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import FeatureItemsLayout from "../../../shared/components/FeatureItemsLayout";
import ValidationDialog from "../../../shared/components/ValidationDialog";
import { AssignmentListProps } from "../types/assignmentScreen";
import AssignmentRow from "./AssignmentRow";
function AssignmentsList({
  assignments,
  confirmationOpen,
  feedbackMessage,
  feedbackSeverity,
  handleClickDelete,
  handleClickDetail,
  handleConfirmDelete,
  setConfirmationOpen,
  setFeedbackMessage,
  setValidationDialogOpen,
  userRole,
  validationDialogOpen,
}: Readonly<AssignmentListProps>) {
  const canManageAssignments = userRole === "teacher" || userRole === "admin";

  return (
    <>
      <FeatureItemsLayout>
        {(assignments ?? []).map((assignment) => (
          <AssignmentRow
            key={assignment.id}
            item={assignment}
            canManage={canManageAssignments}
            onDelete={handleClickDelete ?? (() => undefined)}
            onView={handleClickDetail ?? (() => undefined)}
          />
        ))}
      </FeatureItemsLayout>

      {confirmationOpen ? (
        <ConfirmationDialog
          open={confirmationOpen}
          title="Eliminar la tarea?"
          content={
            <>
              Ten en cuenta que esta accion tambien eliminara <br /> todas las
              entregas asociadas.
            </>
          }
          cancelText="Cancelar"
          deleteText="Eliminar"
          onCancel={() => setConfirmationOpen?.(false)}
          onDelete={handleConfirmDelete ?? (async () => undefined)}
        />
      ) : null}

      {validationDialogOpen ? (
        <ValidationDialog
          open={validationDialogOpen}
          title="Tarea eliminada exitosamente"
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen?.(false);
          }}
        />
      ) : null}

      <FeedbackSnackbar
        open={Boolean(feedbackMessage) && !validationDialogOpen}
        message={feedbackMessage ?? ""}
        severity={feedbackSeverity ?? "success"}
        onClose={() => setFeedbackMessage?.("")}
      />
    </>
  );
}

export default AssignmentsList;
