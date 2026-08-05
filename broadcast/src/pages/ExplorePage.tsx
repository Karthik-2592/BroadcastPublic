// ExplorePage — Stub route for the "/explore" path.
// Placeholder content until the explore feature is implemented.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';

export default function ExplorePage() {
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
      <ExploreOutlinedIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h5" sx={{ color: 'text.primary' }}>
        Explore
      </Typography>
      <Typography variant="body2">
        Discover new content and communities — coming soon.
      </Typography>
    </Box>
  );
}
