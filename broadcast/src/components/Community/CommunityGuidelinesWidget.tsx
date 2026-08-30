import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function CommunityGuidelinesWidget({ guidelines }: { guidelines: string[] }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: '#1a1a2e',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderTop: '2px solid rgba(179, 136, 255, 0.4)',
        p: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: '#fff',
          fontWeight: 600,
          mb: 1.5,
          fontSize: '0.92rem',
        }}
      >
        Community Guidelines
      </Typography>

      <Box
        component="ul"
        sx={{
          m: 0,
          pl: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          color: 'text.secondary',
          fontSize: '0.82rem',
          lineHeight: 1.6,
        }}
      >
        {guidelines.map((guideline) => <li key={guideline}>{guideline}</li>)}
      </Box>
    </Box>
  );
}
