import type { ReactNode } from "react";
import StatefulButton from "./StatefulButton";
import { resolveSubmissionAction } from "../helpers/submissionStatus";

export interface StartFinishActionButtonProps {
  status: string | undefined;
  startLabel: string;
  finishLabel: string;
  onStart: () => void;
  onFinish: () => void;
  loading?: boolean;
}

const PRIMARY_MIN_WIDTH = 184;

export function StartFinishActionButton({
  status,
  startLabel,
  finishLabel,
  onStart,
  onFinish,
  loading = false,
}: Readonly<StartFinishActionButtonProps>): ReactNode {
  const action = resolveSubmissionAction(status);

  if (action === "none") {
    return null;
  }

  return (
    <StatefulButton
      variantStyle="primary"
      loading={loading}
      onClick={action === "start" ? onStart : onFinish}
      sx={{ minWidth: PRIMARY_MIN_WIDTH }}
    >
      {action === "start" ? startLabel : finishLabel}
    </StatefulButton>
  );
}

export default StartFinishActionButton;
