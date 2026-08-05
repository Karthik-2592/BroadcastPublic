// TrendingPage — Stub route for the "/trending" path.
// Placeholder content until the trending feature is implemented.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function TrendingPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <TrendingUpIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h5" sx={{ color: 'text.primary' }}>
        Trending
      </Typography>
      <Typography variant="body2">
        See what's popular right now — coming soon.
      </Typography>
    </Box>
  );
}
