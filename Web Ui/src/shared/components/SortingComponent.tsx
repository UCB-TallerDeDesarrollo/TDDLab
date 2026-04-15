import React from "react";
import { MenuItem, Select } from "@mui/material";
interface SortingProps {
  selectedSorting: string;
  onChangeHandler: (event: { target: { value: string } }) => void;
  prototypeStyle?: boolean;
}

const SortingComponent: React.FC<SortingProps> = ({
  selectedSorting,
  onChangeHandler,
  prototypeStyle = false,
}) => {
  return (
    <Select
      value={selectedSorting}
      onChange={onChangeHandler}
      inputProps={{ "aria-label": "Ordenar" }}
      displayEmpty
      renderValue={() => (prototypeStyle ? "Filtrar" : selectedSorting || "Ordenar")}
      sx={
        prototypeStyle
          ? {
              height: "34px",
              width: "89px",
              fontSize: "14px",
              borderRadius: "5px",
              backgroundColor: "#D9D9D9",
              transition: "background-color 0.2s ease, color 0.2s ease, transform 0.1s",
              "&:hover, &.Mui-focused": {
                backgroundColor: "#5C5C5C",
                ".MuiSelect-select": {
                  color: "#FFFFFF",
                },
                ".MuiSelect-icon": {
                  color: "#FFFFFF",
                },
              },
              "&:active": {
                transform: "scale(0.98)",
              },
              ".MuiSelect-select": {
                fontWeight: 700,
                color: "#000000",
                transition: "color 0.2s ease",
                paddingLeft: "14px",
                paddingRight: "24px !important",
                paddingTop: "8px",
                paddingBottom: "8px",
              },
              ".MuiOutlinedInput-notchedOutline": {
                border: "0.5px solid #2F2F2F",
              },
              ".MuiSelect-icon": {
                color: "#000000",
                right: 8,
                transition: "color 0.2s ease",
              },
            }
          : {
              fontSize: "14px",
              height: "36px",
            }
      }
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
