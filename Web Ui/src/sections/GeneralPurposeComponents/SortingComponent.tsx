import React from "react";
import { MenuItem, Select } from "@mui/material";
interface SortingProps {
  selectedSorting: string;
  onChangeHandler: (event: { target: { value: string } }) => void;
}

const SortingComponent: React.FC<SortingProps> = ({
  selectedSorting,
  onChangeHandler,
}) => {
  return (
    <Select
      value={selectedSorting}
      onChange={onChangeHandler}
      inputProps={{ "aria-label": "Ordenar" }}
      displayEmpty
      style={{ fontSize: "14px", height: "36px" }}
    >
      <MenuItem value="" disabled>
        Ordenar
      </MenuItem>
      <MenuItem value="A_Up_Order">Orden alfabetico ascendente</MenuItem>
      <MenuItem value="A_Down_Order">Orden alfabetico descendente</MenuItem>
      <MenuItem value="Time_Up">Recientes</MenuItem>
      <MenuItem value="Time_Down">Antiguos</MenuItem>
    </Select>
  );
};

export default SortingComponent;
