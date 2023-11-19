import { Grid, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React from "react";
import dayjs from "dayjs";

interface FilterProps {
  onUpdateDates: (newStartDate: Date, newEndDate: Date) => void;
}

const Filter: React.FC<FilterProps> = ({ onUpdateDates }) => {
  const [dataForm, setDataForm] = React.useState({
    dateFrom: new Date(),
    dateTo: new Date(),
  });

  const handleDateFromChange = (newValue: Date | null) => {
    const updatedDateFrom = newValue ?? new Date();
    setDataForm({ ...dataForm, dateFrom: updatedDateFrom });
    onUpdateDates(updatedDateFrom, dataForm.dateTo);
  };

  const handleDateToChange = (newValue: Date | null) => {
    const updatedDateTo = newValue ?? new Date();
    setDataForm({ ...dataForm, dateTo: updatedDateTo });
    onUpdateDates(dataForm.dateFrom, updatedDateTo);
  };

  return (
    <div style={{ marginBottom: "1px" }}>
      <Grid container spacing={1} my={0} justifyContent="flex-end">
        <Grid
          item
          xs={12}
          sm={12}
          xl={6}
          lg={6}
          style={{ marginBottom: "1px" }}
        >
          <DatePicker
            label="Fecha de asignación:"
            value={dataForm.dateFrom}
            onChange={handleDateFromChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                style={{ width: "100%" }}
                value={
                  dataForm.dateFrom
                    ? dayjs(dataForm.dateFrom).format("DD/MM/YYYY")
                    : ""
                }
              />
            )}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          xl={6}
          lg={6}
          style={{ marginBottom: "1px" }}
        >
          <DatePicker
            label="Fecha de entrega"
            minDate={dataForm.dateFrom}
            value={dataForm.dateTo}
            onChange={handleDateToChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                style={{ width: "100%" }}
                value={
                  dataForm.dateTo
                    ? dayjs(dataForm.dateTo).format("DD/MM/YYYY")
                    : ""
                }
              />
            )}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Filter;
