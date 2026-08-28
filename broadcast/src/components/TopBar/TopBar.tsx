import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const submitSearch = (query: string) => {
    if (!query.trim()) return;
    console.log(`[API MOCK] Submitting search query:`, query);
  };

  const debouncedSearchApi = useCallback(
    debounce((query: string) => {
      submitSearch(query);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    debouncedSearchApi(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      debouncedSearchApi.cancel();
      submitSearch(searchQuery);
    }
  };

  return (
    <AppBar
      sx={{
        position: 'fixed',
        top: 0,
        zIndex: 1100,
        elevation: 0,
        background: 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: { xs: 60 },
          px: { xs: 2, md: 3 },
          background: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left branding area matching LeftSidebar width (260px) */}
        <Box sx={{ width: 236, minWidth: 236, display: 'flex', alignItems: 'center', gap: 1, mr: 6 }}>
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

        {/* Center Search Bar area — aligned with feed (starts after 260px area, max-width 640px) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            maxWidth: 640,
            mx: 'auto',
          }}
        >
          <TextField
            size="small"
            placeholder="Search posts, communities, people..."
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
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

        {/* Post Creation CTA & Account controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
          {/* Post Creation CTA Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate('/create')}
            sx={{
              background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 6,
              px: 2,
              py: 0.6,
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(179, 136, 255, 0.25)',
              transition: 'all 0.2s ease-in-out',
              whiteSpace: 'nowrap',
              '&:hover': {
                background: 'linear-gradient(135deg, #a98bdaff 0%, #7452d1ff 100%)',
                boxShadow: '0 4px 16px rgba(179, 136, 255, 0.45)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Create
          </Button>

          {/* Account controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <NotificationsNoneOutlinedIcon fontSize="small" />
            </IconButton>

            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                ml: 0.5,
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
              onClick={() => navigate('/register')}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

