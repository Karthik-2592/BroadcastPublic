import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { exploreCommunities } from '../data/mockData';

export default function CommunityExplorePage() {
  const navigate = useNavigate();
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>(() =>
    exploreCommunities.reduce((acc, c) => ({ ...acc, [c.id]: c.joinState === 'joined' }), {})
  );

  const debouncedJoinApi = useCallback(
    debounce((communityId: string, joinState: boolean) => {
      console.log(`[API MOCK] Community ${communityId} join status:`, joinState);
    }, 500),
    []
  );

  const handleToggleJoin = (e: React.MouseEvent, communityId: string) => {
    e.stopPropagation();
    setJoinedMap((prev) => {
      const nextState = !prev[communityId];
      debouncedJoinApi(communityId, nextState);
      return { ...prev, [communityId]: nextState };
    });
  };
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1280,
        mx: 'auto',
        px: { xs: 2, lg: 3 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: 8,
        pt: 6,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', w: '100%', p: { xs: 2, md: 4 }, gap: 6 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 3,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h4" component="h1" sx={{ color: 'text.primary', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Explore Communities
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 672, lineHeight: 1.6 }}>
              Discover vibrant hubs of knowledge, collaborate with peers, and dive deep into topics shaping the future of technology.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <TextField
              placeholder="Search hubs..."
              size="small"
              sx={{
                width: { xs: '100%', md: 256 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 9999,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: 'text.primary',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputBase-input': { py: 1.25 },
              }}
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
        </Box>

        {/* Communities Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {exploreCommunities.map((community) => {
            const isJoined = joinedMap[community.id] ?? (community.joinState === 'joined');
            return (
              <Card
                key={community.id}
                onClick={() => navigate(`/community/${community.id}`)}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(179,136,255,0.25)',
                    boxShadow: '0 4px 20px rgba(179,136,255,0.08)',
                  },
                }}
              >
                {/* Banner Area */}
                <Box
                  sx={{
                    height: 280,
                    width: '100%',
                    position: 'relative',
                    background: community.bannerGradient,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, #1a1a2e, transparent)',
                      opacity: 0.8,
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      color: 'text.primary',
                      fontWeight: 600,
                      zIndex: 10,
                    }}
                  >
                    {community.name}
                  </Typography>
                  {community.badge && (
                    <Chip
                      label={community.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(52, 52, 64, 0.8)',
                        backdropFilter: 'blur(4px)',
                        color: community.badge === 'Trending' ? 'text.primary' : 'secondary.main',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>

                {/* Card Body */}
                <CardContent
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    '&:last-child': { pb: 3 },
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                    {community.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <ForumOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {community.postCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <GroupOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {community.memberCount}
                        </Typography>
                      </Box>
                    </Box>
                    {!isJoined ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => handleToggleJoin(e, community.id)}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRadius: 2,
                          px: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        }}
                      >
                        Join
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => handleToggleJoin(e, community.id)}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.12)',
                          color: 'text.primary',
                          bgcolor: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: 2,
                          px: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                          },
                        }}
                      >
                        Joined
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
