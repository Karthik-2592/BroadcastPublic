// ProfilePage — Stub route for the "/profile" path.
// Placeholder content until the profile feature is implemented.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export default function ProfilePage() {
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
      <PersonOutlineOutlinedIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h5" sx={{ color: 'text.primary' }}>
        Profile
      </Typography>
      <Typography variant="body2">
        View and edit your profile — coming soon.
      </Typography>
    </Box>
  );
}
