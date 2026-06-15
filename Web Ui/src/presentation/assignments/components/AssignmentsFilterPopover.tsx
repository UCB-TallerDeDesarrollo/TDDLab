import { useId } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { AssignmentSorting } from "../types/assignmentScreen";

interface AssignmentsFilterPopoverProps {
  anchorEl: HTMLElement | null;
  groupList: GroupDataObject[];
  onClose: () => void;
  onGroupChange: (event: SelectChangeEvent<number>) => void;
  onSortingChange: (event: { target: { value: string } }) => void;
  open: boolean;
  selectedGroup: number;
  selectedSorting: AssignmentSorting;
}

const FiltersContainer = styled(Box)(({ theme }) => ({
  minWidth: 280,
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

function AssignmentsFilterPopover({
  anchorEl,
  groupList,
  onClose,
  onGroupChange,
  onSortingChange,
  open,
  selectedGroup,
  selectedSorting,
}: Readonly<AssignmentsFilterPopoverProps>) {
  const groupFieldId = useId();
  const sortingFieldId = useId();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <FiltersContainer>
        <FiltersTitle>Filtros</FiltersTitle>
        <FormControl fullWidth size="small">
          <InputLabel id={groupFieldId}>Grupo</InputLabel>
          <Select<number>
            labelId={groupFieldId}
            value={selectedGroup}
            label="Grupo"
            onChange={onGroupChange}
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
            {groupList.length > 0 ? (
              groupList.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.groupName}
                </MenuItem>
              ))
            ) : (
              <MenuItem value={0} disabled>
                No hay grupos disponibles
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id={sortingFieldId}>Ordenar</InputLabel>
          <Select
            labelId={sortingFieldId}
            value={selectedSorting}
            label="Ordenar"
            onChange={onSortingChange}
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
            <MenuItem value="A_Up_Order">Orden alfabetico ascendente</MenuItem>
            <MenuItem value="A_Down_Order">Orden alfabetico descendente</MenuItem>
            <MenuItem value="Time_Up">Recientes</MenuItem>
            <MenuItem value="Time_Down">Antiguos</MenuItem>
          </Select>
        </FormControl>
      </FiltersContainer>
    </Popover>
  );
}

export default AssignmentsFilterPopover;
