import React from "react";
import { MenuItem, Select } from "@mui/material";
interface SortingProps {
  selectedSorting: string;
  onChangeHandler: (event: { target: { value: string } }) => void;
}

const SortingComponent: React.FC<SortingProps> = ({ selectedSorting, onChangeHandler }) => {
  return (
    <Select
      value={selectedSorting || "default"} // Valor por defecto
      onChange={onChangeHandler}
      className="select-compact"
      sx={{ minWidth: 150 }}
      inputProps={{ "aria-label": "Ordenar" }}
    >
      <MenuItem value="default">Ordenar por...</MenuItem>
      <MenuItem value="A_Up_Order">Nombre (A-Z)</MenuItem>
      <MenuItem value="A_Down_Order">Nombre (Z-A)</MenuItem>
      <MenuItem value="Time_Up">Más recientes</MenuItem>
      <MenuItem value="Time_Down">Más antiguos</MenuItem>
    </Select>
  );
};

export default SortingComponent;
