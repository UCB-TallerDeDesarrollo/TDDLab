import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React from 'react';
import dayjs from 'dayjs';

export const Filter = () => {
  const [dataForm, setDataForm] = React.useState<{
    dateFrom: Date | null;
    dateTo: Date | null;
  }>({
    dateFrom: new Date(),
    dateTo: new Date(),
  });

  return (
    <div style={{ marginBottom: '1px' }}>
      <Grid container spacing={1} my={0} justifyContent='flex-end'>
        <Grid item xs={12} sm={12} xl={6} lg={6} style={{ marginBottom: '1px' }}>
          <DatePicker
            label='Fecha de asignacion:'
            value={dataForm.dateFrom}
            onChange={(newValue) => {
              setDataForm({ ...dataForm, dateFrom: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                style={{ width: '100%' }}
                value={dataForm.dateFrom ? dayjs(dataForm.dateFrom).format('DD/MM/YYYY') : ''}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} xl={6} lg={6} style={{ marginBottom: '1px' }}>
          <DatePicker
            label='Fecha de entrega'
            minDate={dataForm.dateFrom}
            value={dataForm.dateTo}
            onChange={(newValue) => {
              setDataForm({ ...dataForm, dateTo: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                style={{ width: '100%' }}
                value={dataForm.dateTo ? dayjs(dataForm.dateTo).format('DD/MM/YYYY') : ''}
              />
            )}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Filter;