// TrendingPage — Stub route for the "/trending" path.
// Placeholder content until the trending feature is implemented.

import Box from '@mui/material/Box';
import Feed from '../components/Feed/Feed';

export default function TrendingPage() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.53fr',
        justifyContent: 'center',
        gap: 4,
        px: 4,
        pt: 2,
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{ justifySelf: 'end', width: '100%', maxWidth: 720 }}>
        <Feed />
      </Box>

    </Box>
  );
}
