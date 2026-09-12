import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useAuth } from '../../context/AuthContext';
import { displayName, userHandle } from '../../types/api';
import type { UserSummary } from '../../types/api';
import { useMyMemberships } from '../../queries/communities';

// Navigation items corresponding to the wireframe's sidebar tabs
const navItems = [
  { label: 'Home', icon: <HomeOutlinedIcon />, path: '/' },
  { label: 'Trending', icon: <TrendingUpIcon />, path: '/trending' },
  { label: 'Communities', icon: <GroupsOutlinedIcon />, path: '/communities' },
];

export default function LeftSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const { data: communities = [] } = useMyMemberships(isAuthenticated);

  return (
    <Box
      component="aside"
      sx={{
        width: 260,
        minWidth: 260,
        height: 'calc(100vh - 60px)',
        position: 'fixed',
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
      <List >
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{ py: 1, px: 1.5, my: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }
                }
              }}

            />
          </ListItemButton>
        ))}
      </List>

      {/* Create Community Action Button */}
      {isAuthenticated && <Box sx={{ px: 0.5, my: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddRoundedIcon />}
          aria-label="Create your community"
          onClick={() => navigate('/create-community')}
          sx={{
            py: 1,
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            bgcolor: 'rgba(124, 77, 255, 0.1)',
            color: '#7c4dff'
          }}
        >
          Create your community
        </Button>
      </Box>}

      <Divider sx={{ my: 2 }} />

      {/* User's joined communities */}
      <Typography
        variant="overline"
        sx={{ px: 1.5, my: 1, color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.08em' }}
      >
        Your Communities
      </Typography>
      <List disablePadding>
        {communities.map((community) => (
          <ListItemButton
            key={community.id}
            sx={{
              py: 0.8,
              px: 2.2,
              my: 1,
              bgcolor: '#1a1a2e'
            }}
            onClick={() => navigate('/community/' + community.id)}
          >
            <ListItemText
              primary={community.community_name}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Spacer to push profile stub to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      {/* User profile stub — shows logged-in user from AuthContext */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.5)' },
        }}
        onClick={() => navigate(isAuthenticated && currentUser ? `/profile/${currentUser.id}` : '/login')}
      >
        <Avatar
          src={currentUser?.profile_picture?.media_url ?? undefined}
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#7c4dff',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.2rem',
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          {(currentUser?.profile_name ?? '').charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 500 }}>
            {isAuthenticated && currentUser ? displayName(currentUser as unknown as UserSummary) : 'Join Broadcast'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {isAuthenticated && currentUser ? userHandle(currentUser as unknown as UserSummary) : 'Sign in to get started'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
