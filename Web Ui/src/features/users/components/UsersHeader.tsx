import { useId, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import ActionButton from "../../../shared/components/ActionButton";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";

interface UsersHeaderProps {
  groups: GroupDataObject[];
  selectedGroup: number | "all";
  searchQuery: string;
  onGroupChange: (value: number | "all") => void;
  onSearchChange: (value: string) => void;
}

const FiltersContainer = styled(Box)(({ theme }) => ({
  minWidth: 320,
  padding: theme.spacing(2),
  display: "grid",
  gap: theme.spacing(2),
}));

const FiltersTitle = styled(Typography)({
  color: "#002346",
  fontSize: 18,
  fontWeight: 700,
  lineHeight: "22px",
});

function UsersHeader({
  groups,
  selectedGroup,
  searchQuery,
  onGroupChange,
  onSearchChange,
}: UsersHeaderProps) {
  const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const groupFieldId = useId();
  const searchFieldId = useId();

  return (
    <>
      <FeaturePageHeader
        title="Usuarios"
        actions={
          <ActionButton
            endIcon={<KeyboardArrowDownIcon />}
            variantStyle="secondary"
            onClick={(event) => setFiltersAnchorEl(event.currentTarget)}
          >
            Filtrar
          </ActionButton>
        }
      />

      <Popover
        open={Boolean(filtersAnchorEl)}
        anchorEl={filtersAnchorEl}
        onClose={() => setFiltersAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <FiltersContainer>
          <FiltersTitle>Filtros de usuarios</FiltersTitle>

          <TextField
            id={searchFieldId}
            size="small"
            label="Buscar por correo"
            placeholder="Ej: nombre@ucb.edu.bo"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id={groupFieldId}>Grupo</InputLabel>
            <Select
              labelId={groupFieldId}
              value={selectedGroup}
              label="Grupo"
              onChange={(event) =>
                onGroupChange(event.target.value as number | "all")
              }
                            MenuProps={{
                PaperProps: { sx: { bgcolor: '#F0F0F0', borderRadius: 1, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', mt: 0.5 } },
                sx: {
                  '& .MuiMenuItem-root': { backgroundColor: 'transparent' },
                  '& .MuiMenuItem-root:hover': { backgroundColor: '#E6F0FA' },
                  '& .MuiMenuItem-root.Mui-selected': { backgroundColor: 'transparent' },
                  '& .MuiMenuItem-root.Mui-selected:hover': { backgroundColor: '#E6F0FA' },
                  '& .MuiMenuItem-root.Mui-focusVisible': { backgroundColor: 'transparent' }
                }
              }}
            >
              <MenuItem value="all">Todos los grupos</MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FiltersContainer>
      </Popover>
    </>
  );
}

export default UsersHeader;
