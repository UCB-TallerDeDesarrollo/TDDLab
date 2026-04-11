import React from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Stack, SvgIcon } from '@mui/material';
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
                icon={<Box sx={{ width: 24, height: 24, backgroundColor: '#D9D9D9', border: '1px solid #737373', borderRadius: '4px' }} />}
              />
            }
            label={flag.feature_name}
          />
        ))}
      </Stack>
    </Box>
  );
};
