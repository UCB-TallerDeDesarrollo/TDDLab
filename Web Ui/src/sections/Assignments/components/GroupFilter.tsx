import React from "react";
import { MenuItem, SelectChangeEvent, Select } from "@mui/material";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

interface GroupFilterProps {
  selectedGroup: number;
  groupList: GroupDataObject[];
  
  onChangeHandler: (event: SelectChangeEvent<number>) => void;
  defaultName: string;
}

const GroupFilter: React.FC<GroupFilterProps> = ({
  selectedGroup,
  groupList,
  onChangeHandler,
  defaultName = "Prueba",
}) => {
  return (
    <Select
      value={selectedGroup}
      onChange={onChangeHandler}
      displayEmpty
      sx={{
        fontSize: "0.95rem",
        minHeight: "42px",
        borderRadius: "17px",
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "17px",
        },
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          minHeight: "42px",
          boxSizing: "border-box",
          paddingTop: "8px",
          paddingBottom: "8px",
        },
      }}
    >
      <MenuItem value={0} disabled>
        {defaultName}
      </MenuItem>
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
  );
};

export default GroupFilter;