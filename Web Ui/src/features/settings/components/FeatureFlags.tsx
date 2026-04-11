import React from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { FeatureFlag } from '../types/settings.types';

interface FeatureFlagsProps {
  flags: FeatureFlag[];
  onToggleFlag: (id: number, value: boolean) => void;
}

export const FeatureFlags: React.FC<FeatureFlagsProps> = ({ flags, onToggleFlag }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#002346',
          mb: 2,
        }}
      >
        Habilitación de Funcionalidades:
      </Typography>
      
      <Stack spacing={1}>
        {flags.map((flag) => (
          <FormControlLabel
            key={flag.id}
            control={
              <Checkbox
                checked={flag.is_enabled}
                onChange={(e) => onToggleFlag(flag.id, e.target.checked)}
                color="primary"
              />
            }
            label={flag.feature_name}
          />
        ))}
      </Stack>
    </Box>
  );
};
