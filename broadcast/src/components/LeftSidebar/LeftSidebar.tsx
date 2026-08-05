// LeftSidebar — Navigation panel with page links and user community listings.
// Fixed 240px width; contains navigation tabs (Explore, Trending, Communities)
// and a "Your Communities" section listing the user's joined communities.

import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { userCommunities } from '../../data/mockData';

// Navigation items corresponding to the wireframe's sidebar tabs
const navItems = [
  { label: 'Home', icon: <HomeOutlinedIcon />, path: '/' },
  { label: 'Explore', icon: <ExploreOutlinedIcon />, path: '/explore' },
  { label: 'Trending', icon: <TrendingUpIcon />, path: '/trending' },
  { label: 'Communities', icon: <GroupsOutlinedIcon />, path: '/communities' },
];

export default function LeftSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      component="aside"
      sx={{
        width: 240,
        minWidth: 240,
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: 60,
        overflowY: 'auto',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: 1.5,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Primary navigation tabs */}
      <List disablePadding>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{ py: 1, px: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* User's joined communities */}
      <Typography
        variant="overline"
        sx={{ px: 1.5, mb: 1, color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em' }}
      >
        Your Communities
      </Typography>
      <List disablePadding>
        {userCommunities.map((community) => (
          <ListItemButton key={community.id} sx={{ py: 0.75, px: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  bgcolor: community.avatarColor,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                {community.name.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={community.name}
              primaryTypographyProps={{ fontSize: '0.85rem' }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Spacer to push profile stub to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      {/* User profile stub */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
        }}
        onClick={() => navigate('/profile')}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#7c4dff', fontSize: '0.85rem' }}>U</Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 500 }}>
            Guest User
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            @guest
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
