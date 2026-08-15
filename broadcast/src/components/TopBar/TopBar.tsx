// TopBar — Application header with logo, search bar, and account controls.
// Spans the full viewport width; uses MUI AppBar with a 3-section toolbar layout.

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';

export default function TopBar() {
  return (
    <AppBar sx={{
      position: "sticky",
      elevation: 0,
      background: 'none'
    }}>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gridTemplateColumns: '240px 1fr auto',
          gap: 2,
          minHeight: { xs: 60 },
          px: { xs: 2, md: 3 },
          background: 'rgba(10, 10, 10, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo / branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CellTowerRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #b388ff 0%, #69f0ae 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            Broadcast
          </Typography>
        </Box>

        {/* Search bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          maxWidth: 650,
          mx: 'auto',
          my: 'auto',
          width: '100%',
          position: 'fixed',
          left: '33%',
          borderRadius: '50px',
        }}>
          <TextField
            size="small"
            placeholder="Search posts, communities, people..."
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Account controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            sx={{
              ml: 1,
              borderColor: 'rgba(179,136,255,0.4)',
              color: 'primary.light',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' },
            }}
          >
            Log In
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: 'primary.main',
              color: '#0f0f1a',
              fontWeight: 600,
              '&:hover': { bgcolor: 'primary.light' },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
