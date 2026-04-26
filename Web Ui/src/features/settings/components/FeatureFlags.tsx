import React from 'react';
import { Box, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { FeatureFlag } from '../types/settings.types';
import AnimatedCheckbox from '../../../shared/components/AnimatedCheckbox';

interface FeatureFlagsProps {
  flags: FeatureFlag[];
  onToggleFlag: (id: number, value: boolean) => void;
}

export const FeatureFlags: React.FC<FeatureFlagsProps> = ({ flags, onToggleFlag }) => {
  return (
    <Box sx={{ width: '100%', pl: 0 }}>
      <Stack spacing={1}>
        {flags.map((flag) => (
          <FormControlLabel
            key={flag.id}
            control={
              <AnimatedCheckbox
                checked={flag.is_enabled}
                onChange={(e) => onToggleFlag(flag.id, e.target.checked)}
              />
            }
            label={flag.feature_name}
          />
        ))}
      </Stack>
    </Box>
  );
};
