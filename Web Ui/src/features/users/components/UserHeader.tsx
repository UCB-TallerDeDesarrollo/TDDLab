import { FormControl, MenuItem, Select } from "@mui/material";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

interface UsersHeaderProps {
  groups: GroupDataObject[];
  selectedGroup: number | "all";
  onGroupChange: (value: number | "all") => void;
}

function UsersHeader({
  groups,
  selectedGroup,
  onGroupChange,
}: UsersHeaderProps) {
  return (
    <div
      style={{
        width: "82%",
        boxSizing: "border-box",
        margin: "20px auto",
        padding: "16px 20px",
        border: "1px solid #CFCFCF",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#1B3A57",
          marginLeft: "25%",
        }}
      >
        Usuarios
      </div>

      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={selectedGroup}
          onChange={(event) =>
            onGroupChange(event.target.value as number | "all")
          }
          displayEmpty
          size="small"
          sx={{
            backgroundColor: "#1976D2",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "13px",
            height: "32px",
            minWidth: "160px",
            ".MuiSelect-select": {
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
            },
            ".MuiSvgIcon-root": {
              color: "#fff",
              fontSize: "18px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          <MenuItem value="all">Filtrar todos los grupos</MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.groupName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default UsersHeader;