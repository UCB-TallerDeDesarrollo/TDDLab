import { Checkbox, CheckboxProps, styled, keyframes } from '@mui/material';

const checkBounce = keyframes`
  0% { transform: rotate(45deg) scale(0) translate(-1px, -2px); }
  50% { transform: rotate(45deg) scale(1.2) translate(-1px, -2px); }
  100% { transform: rotate(45deg) scale(1) translate(-1px, -2px); }
`;

const StyledIcon = styled('span')(() => ({
  borderRadius: 4,
  width: 24,
  height: 24,
  boxSizing: 'border-box',
  border: '1.5px solid #898989',
  backgroundColor: '#E0E0E0',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  'input:hover ~ &': {
    backgroundColor: '#757575',
    borderColor: '#757575',
  },
  
  'input:active ~ &': {
    transform: 'scale(0.95)',
  },
}));

const StyledCheckedIcon = styled(StyledIcon)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  
  'input:hover ~ &': {
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
  },

  '&::before': {
    content: '""',
    display: 'block',
    width: 6,
    height: 12,
    border: 'solid #fff',
    borderWidth: '0 2px 2px 0',
    transform: 'rotate(45deg) translate(-1px, -2px)',
    animation: `${checkBounce} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
  },
}));

export const AnimatedCheckbox = (props: CheckboxProps) => {
  return (
    <Checkbox
      disableRipple
      color="default"
      checkedIcon={<StyledCheckedIcon />}
      icon={<StyledIcon />}
      {...props}
    />
  );
};

export default AnimatedCheckbox;
