import { Typography, Button } from '@mui/material';

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
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div
      style={{
        border: '2px solid #b0b0b0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '100%',
        height: '60vh',
        overflowY: 'scroll',
        overflowX: 'hidden',
        padding: '10px',
        marginBottom: '10px',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        style={{ fontSize: "16px", lineHeight: "1.8", whiteSpace: 'pre-wrap' }}
      >
        {loading ? title : response }
      </Typography>
    </div>
    <Button
      variant="contained"
      color="primary"
      style={{
        textTransform: 'none',
        fontSize: '15px',
      }}
      onClick={onAction}
      disabled={loading}
    >
      {buttonText}
    </Button>
  </div>
);

export default AIResultSection;