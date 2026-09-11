import { useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import type { Notification } from '../../types/api';
import { displayName, userHandle } from '../../types/api';

type SearchResultType = 'post' | 'community' | 'user';

interface SearchResult {
  id: string;
  type: SearchResultType;
  name: string;
  count: number;
}


const resultIcon = (type: SearchResultType) => {
  if (type === 'post') return <ArticleOutlinedIcon fontSize="small" />;
  if (type === 'community') return <GroupsOutlinedIcon fontSize="small" />;
  return <PersonOutlineIcon fontSize="small" />;
};

const resultCountLabel = (result: SearchResult) => {
  if (result.type === 'post') return `${result.count} favorites`;
  if (result.type === 'community') return `${result.count} members`;
  return `${result.count} followers`;
};

export default function TopBar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsCursor, setNotificationsCursor] = useState<string | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const searchRequest = useRef(0);

  const handleLogout = () => {
    setAccountMenuAnchor(null);
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setHasNotifications(false);
      setNotifications([]);
      setNotificationsCursor(null);
      return;
    }
    let active = true;
    void fetch(`${BASE_URL}/notifications/status`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() as Promise<{ data?: { hasNotifications?: boolean } }> : null)
      .then((body) => {
        if (active) setHasNotifications(Boolean(body?.data?.hasNotifications));
      })
      .catch(() => {
        console.error('Unable to check notifications');
        if (active) setHasNotifications(false);
      });
    return () => { active = false; };
  }, [isAuthenticated]);

  const loadNotifications = async (cursor?: string | null) => {
    setNotificationsLoading(true);
    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const response = await fetch(`${BASE_URL}/notifications${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load notifications');
      const body = await response.json() as { data?: Notification[]; cursor?: string };
      const page = Array.isArray(body.data) ? body.data : [];
      setNotifications((current) => cursor ? [...current, ...page] : page);
      setNotificationsCursor(body.cursor === 'null' ? null : body.cursor ?? null);
      setHasNotifications(false);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isAuthenticated) return;
    setNotificationAnchor(event.currentTarget);
    setNotifications([]);
    setNotificationsCursor(null);
    void loadNotifications().catch((error: unknown) => {
      console.error('Unable to load notifications:', error);
    });
  };

  const submitSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    setIsSearchOpen(true);
    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    const requestId = ++searchRequest.current;
    setIsSearching(true);
    let results: SearchResult[] = [];

    // The endpoint is intentionally provisional until the search API is available.
    try {
      const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(trimmedQuery)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Search request failed');
      const body = await response.json() as { data?: SearchResult[] };
      if (body.data) {
        const data = body.data as SearchResult[] | {
          users?: Array<{ id: string; profile_name?: string; username: string; follower_count?: number }>;
          posts?: Array<{ id: string; title: string; favorite_count: number }>;
          communities?: Array<{ id: string; community_name: string; population: number }>;
        };
        results = Array.isArray(data) ? data.slice(0, 10) : [
          ...(data.posts ?? []).map((post) => ({ id: post.id, type: 'post' as const, name: post.title, count: post.favorite_count })),
          ...(data.communities ?? []).map((community) => ({ id: community.id, type: 'community' as const, name: community.community_name, count: community.population })),
          ...(data.users ?? []).map((user) => ({ id: user.id, type: 'user' as const, name: user.profile_name ?? user.username, count: user.follower_count ?? 0 })),
        ].slice(0, 10);
      }
    } catch {
      results = [];
    }

    if (requestId === searchRequest.current) {
      setSearchResults(results);
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 50);
    setSearchQuery(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitSearch(searchQuery);
    }
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
    if (result.type === 'post') navigate(`/post/${result.id}`);
    if (result.type === 'community') navigate(`/community/${result.id}`);
    if (result.type === 'user') navigate(`/profile/${result.id}`);
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
          background: 'rgba(10, 10, 10, 0.55)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
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
            minWidth: 640,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          onBlur={handleSearchBlur}
        >
          <TextField
            size="small"
            placeholder="Search posts, communities, people..."
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            sx={{
              '& input:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0px 1000px transparent inset',
                WebkitTextFillColor: 'white',
                transition: 'background-color 5000s ease-in-out 0s',
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      aria-label="Search"
                      size="small"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => submitSearch(searchQuery)}
                      sx={{ color: 'text.secondary', p: 0.25 }}
                    >
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                inputProps: { maxLength: 50 },
              },
            }}
          />
          {isSearchOpen && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                top: 'calc(100% + 16px)',
                left: 0,
                right: 0,
                zIndex: 1200,
                overflow: 'hidden',
                background: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4
              }}
            >
              {isSearching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : searchResults.length > 0 ? (
                <List disablePadding>
                  {searchResults.map((result) => (
                    <ListItemButton
                      key={`${result.type}-${result.id}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleResultClick(result)}
                      sx={{ borderRadius: 0, px: 2, py: 1 }}
                    >
                      <Box sx={{ display: 'flex', color: 'primary.light', mr: 1.5 }}>
                        {resultIcon(result.type)}
                      </Box>
                      <ListItemText
                        primary={result.name}
                        secondary={resultCountLabel(result)}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: '0.9rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }
                          },
                          secondary: {
                            sx: {
                              fontSize: '0.75rem'
                            }
                          }
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography sx={{ p: 2, color: 'text.secondary', fontSize: '0.85rem' }}>
                  No results found
                </Typography>
              )}
            </Paper>
          )}
        </Box>

        {/* Post Creation CTA & Account controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
          {/* Post Creation CTA Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate(isAuthenticated ? '/create' : '/login')}
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
            <IconButton
              size="small"
              aria-label="Notifications"
              onClick={handleNotificationsClick}
              sx={{ color: 'text.secondary' }}
            >
              <Badge color="error" variant="dot" invisible={!hasNotifications}>
                {hasNotifications
                  ? <NotificationsActiveOutlinedIcon fontSize="small" />
                  : <NotificationsNoneOutlinedIcon fontSize="small" />}
              </Badge>
            </IconButton>
            <Menu
              id="notifications-menu"
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() => setNotificationAnchor(null)}
              disableScrollLock
              slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)', maxHeight: 420 } } }}
            >
              {notificationsLoading && notifications.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={22} /></Box>
              ) : notifications.length === 0 ? (
                <Typography sx={{ p: 2, color: 'text.secondary', fontSize: '0.85rem' }}>No notifications</Typography>
              ) : (
                <List disablePadding>
                  {notifications.map((notification) => {
                    const user = notification.user_summary;
                    return (
                      <ListItemButton
                        key={notification.id}
                        onClick={() => { setNotificationAnchor(null); if (user) navigate(`/profile/${user.id}`); }}
                        sx={{ alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}
                      >
                        <Avatar src={user?.profile_picture ?? undefined} sx={{ width: 36, height: 36, bgcolor: '#343440' }}>
                          {displayName(user).charAt(0)}
                        </Avatar>
                        <ListItemText
                          primary={user ? `${displayName(user)} followed you` : 'A user followed you'}
                          secondary={user ? userHandle(user) : undefined}
                          slotProps={{ primary: { sx: { fontSize: '0.88rem', fontWeight: 600 } }, secondary: { sx: { fontSize: '0.75rem' } } }}
                        />
                      </ListItemButton>
                    );
                  })}
                  {notificationsCursor && (
                    <Box sx={{ p: 1 }}>
                      <Button fullWidth variant="outlined" onClick={() => void loadNotifications(notificationsCursor).catch((error: unknown) => console.error('Unable to load more notifications:', error))} disabled={notificationsLoading}>
                        {notificationsLoading ? <CircularProgress size={18} /> : 'Load more'}
                      </Button>
                    </Box>
                  )}
                </List>
              )}
            </Menu>

            {!isAuthenticated && <Button
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
            </Button>}
            {!isAuthenticated && <Button
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
            </Button>}
            {isAuthenticated && <IconButton
              size="small"
              aria-label="Account menu"
              onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' },
              }}
            >
              <MoreHorizIcon />
            </IconButton>}
            <Menu
              id="account-menu"
              anchorEl={accountMenuAnchor}
              open={Boolean(accountMenuAnchor)}
              onClose={() => setAccountMenuAnchor(null)}
              disableScrollLock
            >
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
