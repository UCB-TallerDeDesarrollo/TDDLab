import {
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";

import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";

interface UsersHeaderProps {
  searchQuery: string;
  selectedGroup: number | "all";
  groups: GroupDataObject[];
  onSearchChange: (value: string) => void;
  onGroupChange: (value: number | "all") => void;
}

const HeaderContainer = styled("div")({
  width: "82%",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const HeaderFilters = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const Title = styled("h2")({
  fontSize: "18px",
  fontWeight: 600,
  margin: 0,
});

function UsersHeader({
  searchQuery,
  selectedGroup,
  groups,
  onSearchChange,
  onGroupChange,
}: UsersHeaderProps) {
  const handleSelectChange = (event: SelectChangeEvent<number | "all">) => {
    onGroupChange(event.target.value as number | "all");
  };

  return (
    <HeaderContainer>
      <Title>Usuarios</Title>

      <HeaderFilters>
        <TextField
          placeholder="Buscar por email"
          size="small"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedGroup}
            onChange={handleSelectChange}
            displayEmpty
          >
            <MenuItem value="all">Filtrar todos los grupos</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.groupName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </HeaderFilters>
    </HeaderContainer>
  );
}

export default UsersHeader;