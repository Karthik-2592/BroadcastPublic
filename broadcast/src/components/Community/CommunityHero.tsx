import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import { useAuth } from '../../context/AuthContext';

export default function CommunityHero() {
  const navigate = useNavigate();
  const { isAuthenticated, isMember } = useAuth();

  const debouncedJoinCommunityApi = useCallback(
    debounce(() => {
      console.log(`[API MOCK] Joined community: Web Developers`);
    }, 500),
    []
  );

  const handleJoin = () => {
    debouncedJoinCommunityApi();
  };

  const isMemberAndAuthed = isAuthenticated && isMember;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 280,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        mb: 3,
        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC_hMgUDtQc33ZyA_b-HI2lBkUw-QvBohNMCh3Wueks2Bdj2NEVk1oKEd9sg4OxFSveTjlu2X0dEpVHkbeBjgj9NY0GccQqXBGaRM3ifFyf6ljxNT3F1PibmtZZyxQWr2uisrAeZdVLR9OlSX7RhfEBZ5xYRpfHQefM4d2UUYrYx2iJK-phDSFAS5GJzgxp5ElH4JXry2T7go9nbURq8uZG9eBfseZOCrvYlc8tQKMCZGj_3oFrtgIpIEAmv4olJEZK3w')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(18, 18, 29, 0.95) 0%, rgba(26, 26, 46, 0.6) 50%, rgba(0,0,0,0.2) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          {/* Left Text Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 620 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#69f0ae',
                  boxShadow: '0 0 12px rgba(105, 240, 174, 0.6)',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#69f0ae',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}
              >
                Community
              </Typography>
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{ color: '#fff', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              Web Developers
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.9rem' }}
            >
              A space for full-stack developers to share projects, ask questions, and discuss the latest in React, Node.js, and modern web architecture.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
              <PeopleOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500 }}>
                12,400 Members
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {isMemberAndAuthed ? (
              <Button
                variant="contained"
                onClick={() => navigate('/create')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: '#12121d',
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(179, 136, 255, 0.35)',
                  '&:hover': {
                    bgcolor: '#a98bda',
                    boxShadow: '0 6px 22px rgba(179, 136, 255, 0.5)',
                  },
                }}
              >
                Create Post
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleJoin}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: '#12121d',
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(179, 136, 255, 0.35)',
                  '&:hover': {
                    bgcolor: '#a98bda',
                    boxShadow: '0 6px 22px rgba(179, 136, 255, 0.5)',
                  },
                }}
              >
                Join Community
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

