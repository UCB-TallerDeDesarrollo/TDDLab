import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

interface CreateButtonProps {
  onClick: () => void;
  label?: string;
  minWidth?: string | number;
  borderRadius?: string | number;
  sx?: object;
}

function CreateButton({
  onClick,
  label = "Crear",
  minWidth = "100px",
  borderRadius = "10px",
  sx = {},
}: Readonly<CreateButtonProps>) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{
        borderRadius,
        textTransform: "none",
        fontSize: "0.95rem",
        minWidth,
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}

export default CreateButton;