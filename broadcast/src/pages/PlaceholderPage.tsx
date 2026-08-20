import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PlaceholderPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 6,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          Coming Soon
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
          This page is currently a placeholder. We are working hard to build out this section of the platform. Please check back later!
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'primary.light',
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );
}
