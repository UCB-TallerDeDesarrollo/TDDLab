import React from "react";
import { MenuItem, SelectChangeEvent, Select } from "@mui/material";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { typographyVariants } from "../../../styles/typography";

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
      style={{ ...typographyVariants.paragraphMedium, height: "36px" }}
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