
import { Box, Typography, Stack, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SortingComponent from "../../../shared/components/SortingComponent";

interface Props {
  selectedSorting: string;
  onSort: (event: { target: { value: string } }) => void;
  onCreate: () => void;
}

export function GroupsToolbar({ selectedSorting, onSort, onCreate }: Props) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        Grupos
      </Typography>

      <Stack direction="row" spacing={2}>
        <SortingComponent
          selectedSorting={selectedSorting}
          onChangeHandler={onSort}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreate}
        >
          Crear Grupo
        </Button>
      </Stack>
    </Box>
  );
}