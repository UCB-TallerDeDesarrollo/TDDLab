import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
interface SortingProps {
  selectedSorting: string;
  onChangeHandler: (event: { target: { value: string } }) => void;
}

const SortingComponent: React.FC<SortingProps> = ({
  selectedSorting,
  onChangeHandler,
}) => {
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const handleSelectSort = (value: string) => {
    onChangeHandler({ target: { value } });
    setFilterAnchor(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        className="generic-list-action-btn generic-list-action-btn--outlined"
        endIcon={<FilterListIcon />}
        onClick={(event) => setFilterAnchor(event.currentTarget)}
      >
        Filtrar
      </Button>
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem
          selected={selectedSorting === "A_Up_Order"}
          onClick={() => handleSelectSort("A_Up_Order")}
        >
          Orden alfabetico ascendente
        </MenuItem>
        <MenuItem
          selected={selectedSorting === "A_Down_Order"}
          onClick={() => handleSelectSort("A_Down_Order")}
        >
          Orden alfabetico descendente
        </MenuItem>
        <MenuItem
          selected={selectedSorting === "Time_Up"}
          onClick={() => handleSelectSort("Time_Up")}
        >
          Recientes
        </MenuItem>
        <MenuItem
          selected={selectedSorting === "Time_Down"}
          onClick={() => handleSelectSort("Time_Down")}
        >
          Antiguos
        </MenuItem>
      </Menu>
    </>
  );
};

export default SortingComponent;
