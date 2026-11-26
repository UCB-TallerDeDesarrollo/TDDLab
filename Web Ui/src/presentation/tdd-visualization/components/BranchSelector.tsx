
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  CircularProgress,
  Box,
} from "@mui/material";

import type {
  SelectChangeEvent,
} from "@mui/material/Select";


export interface BranchSelectorProps {
  branches: string[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
  loading = false,
  disabled = false,
}: Readonly<BranchSelectorProps>) {
  const handleChange = (
    event: SelectChangeEvent<string>
  ) => {
    const branch = event.target.value;
    onBranchChange(branch);
  };

  const uniqueBranches = [
    ...new Set(
      branches.filter(
        (branch) =>
          typeof branch === "string" &&
          branch.trim().length > 0
      )
    ),
  ];

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <FormControl
        fullWidth
        size="medium"
        disabled={disabled || loading}
      >
        <InputLabel id="branch-selector-label">
          Rama del repositorio
        </InputLabel>

        <Select
          labelId="branch-selector-label"
          id="branch-selector"
          data-testid="branch-selector"
          value={selectedBranch}
          onChange={handleChange}
          label="Rama del repositorio"
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "6px",

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#cbd5e1",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2b5b7f",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2b5b7f",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 320,
                borderRadius: "8px",
                marginTop: 1,
                boxShadow:
                  "0px 4px 15px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          <MenuItem
            value=""
            data-testid="branch-option-default"
          >
            Predeterminada del repositorio
          </MenuItem>

          <MenuItem
            value="all"
            data-testid="branch-option-all"
          >
            Todas las ramas
          </MenuItem>

          {uniqueBranches.map((branch) => (
            <MenuItem
              key={branch}
              value={branch}
              data-testid={`branch-option-${branch}`}
            >
              {branch}
            </MenuItem>
          ))}
        </Select>

        <FormHelperText>
          {loading
            ? "Cargando ramas disponibles..."
            : "Selecciona la rama que deseas analizar."}
        </FormHelperText>
      </FormControl>

      {loading && (
        <CircularProgress
          size={22}
          sx={{
            color: "#052845",
            alignSelf: "center",
          }}
        />
      )}
    </Box>
  );
}

export default BranchSelector;
