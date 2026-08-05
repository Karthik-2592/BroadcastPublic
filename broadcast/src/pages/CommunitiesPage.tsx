// CommunitiesPage — Stub route for the "/communities" path.
// Placeholder content until the communities feature is implemented.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

export default function CommunitiesPage() {
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
      <GroupsOutlinedIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h5" sx={{ color: 'text.primary' }}>
        Communities
      </Typography>
      <Typography variant="body2">
        Browse and join communities — coming soon.
      </Typography>
    </Box>
  );
}
