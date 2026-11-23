
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

import AccountTreeIcon from "@mui/icons-material/AccountTree";

// =====================================================
// PROPIEDADES
// =====================================================

export interface BranchSelectorProps {
  branches: string[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

// =====================================================
// COMPONENTE
// =====================================================

function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
  loading = false,
  disabled = false,
}: Readonly<BranchSelectorProps>) {

  // ===================================================
  // CAMBIO DE RAMA
  // ===================================================

  const handleChange = (
    event: SelectChangeEvent<string>
  ) => {
    const branch = event.target.value;

    onBranchChange(branch);
  };

  // ===================================================
  // NORMALIZACIÓN DE RAMAS
  // ===================================================

  const uniqueBranches = [
    ...new Set(
      branches.filter(
        (branch) =>
          typeof branch === "string" &&
          branch.trim().length > 0
      )
    ),
  ];

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >

      <AccountTreeIcon
        sx={{
          color: "#052845",
          fontSize: 28,
        }}
      />

      <FormControl
        fullWidth
        size="medium"
        disabled={disabled || loading}
      >

        <InputLabel
          id="branch-selector-label"
        >
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
            borderRadius: "8px",

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#CBD5E1",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#052845",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#052845",
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

          {/* Rama predeterminada del backend */}

          <MenuItem
            value=""
            data-testid="branch-option-default"
          >
            Predeterminada del repositorio
          </MenuItem>

          {/* Ramas recibidas desde BranchSupport */}

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
          }}
        />
      )}

    </Box>
  );
}

export default BranchSelector;
