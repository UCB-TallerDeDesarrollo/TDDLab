import React from "react";
import { MenuItem, Select } from "@mui/material";
interface SortingProps {
  selectedSorting: string;
  onChangeHandler: (event: { target: { value: string } }) => void;
  prototypeStyle?: boolean;
  placeholderText?: string;
}

const SortingComponent: React.FC<SortingProps> = ({
  selectedSorting,
  onChangeHandler,
  prototypeStyle = false,
  placeholderText,
}) => {
  const sortingLabels: Record<string, string> = {
    "": placeholderText ?? (prototypeStyle ? "Filtrar" : "Ordenar"),
    A_Up_Order: "A-Z",
    A_Down_Order: "Z-A",
    Time_Up: "Recientes",
    Time_Down: "Antiguos",
  };

  return (
    <Select
      value={selectedSorting}
      onChange={onChangeHandler}
      inputProps={{ "aria-label": "Ordenar" }}
      displayEmpty
      renderValue={(value) => sortingLabels[String(value)] ?? String(value)}
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
