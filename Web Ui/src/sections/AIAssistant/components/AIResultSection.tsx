import { Typography, Button, Box } from '@mui/material';

const AIResultSection = ({
  title,
  response,
  loading,
  onAction,
  buttonText,
}: {
  title: string;
  response: string;
  loading: boolean;
  onAction: () => void;
  buttonText: string;
}) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Box
      sx={{
        border: '2px solid #b0b0b0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '100%',
        height: { xs: '40vh', sm: '50vh', md: '60vh' },
        overflowY: 'scroll',
        overflowX: 'hidden',
        padding: '10px',
        marginBottom: '10px',
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: '14px', md: '16px' }, lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
      >
        {loading ? title : response}
      </Typography>
    </Box>
    <Button
      variant="contained"
      color="primary"
      sx={{
        textTransform: 'none',
        fontSize: '15px',
        minHeight: '44px',
      }}
      onClick={onAction}
      disabled={loading}
    >
      {buttonText}
    </Button>
  </Box>
);

export default AIResultSection;
