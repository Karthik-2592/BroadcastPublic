// PostViewPage — Full expanded view of a single post, with inline CommentsSection below.
// Route: /post/:postId  (nested inside MainLayout — sidebar + topbar remain visible)
// Uses existing MockPost data; comment data comes from CommentsSection defaults.

import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import RepeatIcon from '@mui/icons-material/Repeat';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CommentsSection from '../components/CommentsSection/CommentsSection';
import { mockPosts } from '../data/mockData';

export default function PostViewPage() {
  const { postId } = useParams<{ postId: string }>();
  const post = mockPosts.find((p) => p.id === postId) ?? mockPosts[0];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.53fr',
        justifyContent: 'center',
        gap: 4,
        px: 4,
        py: 2,
        width: '100%',
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          justifySelf: 'end',
          gap: 4,
        }}
      >
        {/* ── Post Card ── */}
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'background.paper',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': { boxShadow: '0 8px 32px rgba(179,136,255,0.1)' },
          }}
        >
          {/* Gradient top accent bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #b388ff 0%, #69f0ae 100%)',
              opacity: 0.6,
              transition: 'opacity 0.3s ease',
              '.MuiBox-root:hover > &': { opacity: 1 },
            }}
          />

          <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3, pt: { xs: 3.5, md: 4.5 } }}>
            {/* Post Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: post.author.avatarColor,
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: '2px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {post.author.name.charAt(0)}
                  </Avatar>
                  {/* Online indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 1,
                      right: 1,
                      width: 10,
                      height: 10,
                      bgcolor: '#69f0ae',
                      borderRadius: '50%',
                      border: '2px solid #1a1a2e',
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {post.author.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                    {post.author.handle} · {post.timestamp}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' } }}
              >
                <MoreHorizIcon />
              </IconButton>
            </Box>

            {/* Post Content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 700,
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                {post.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', lineHeight: 1.75, fontSize: '0.95rem' }}
              >
                {post.content}
              </Typography>

              {/* Optional media placeholder */}
              {post.mediaPlaceholder && (
                <Box
                  sx={{
                    width: '100%',
                    height: 240,
                    borderRadius: 2,
                    background: post.mediaPlaceholder,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.72rem',
                        height: 24,
                        borderColor: 'rgba(179,136,255,0.25)',
                        color: 'primary.light',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(179,136,255,0.08)' },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Post Actions */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PostActionBtn
                icon={<FavoriteBorderIcon sx={{ fontSize: 20 }} />}
                label={post.likes.toString()}
                hoverColor="rgba(244, 67, 54, 0.15)"
                hoverTextColor="#ef9a9a"
              />
              <PostActionBtn
                icon={<ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />}
                label={post.comments.toString()}
                active
                hoverColor="rgba(179,136,255,0.1)"
                hoverTextColor="#d4bbff"
              />
              <PostActionBtn
                icon={<RepeatIcon sx={{ fontSize: 20 }} />}
                label={post.shares.toString()}
                hoverColor="rgba(105, 240, 174, 0.1)"
                hoverTextColor="#69f0ae"
              />
              <Box sx={{ flex: 1 }} />
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' } }}
              >
                <BookmarkBorderIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* ── Comments Section ── */}
        <CommentsSection />
      </Box>
      <Box sx={{ width: '100%' }}>

      </Box>
    </Box>
  );
}

// Small reusable post action button
interface PostActionBtnProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hoverColor?: string;
  hoverTextColor?: string;
}

function PostActionBtn({ icon, label, active = false, hoverColor, hoverTextColor }: PostActionBtnProps) {
  return (
    <Button
      size="small"
      startIcon={icon}
      sx={{
        color: active ? 'primary.light' : 'text.secondary',
        bgcolor: active ? 'rgba(179,136,255,0.08)' : 'transparent',
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.82rem',
        borderRadius: 4,
        px: 1.5,
        py: 0.5,
        minWidth: 0,
        '& .MuiButton-startIcon': { mr: 0.5 },
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: hoverColor,
          color: hoverTextColor,
        },
      }}
    >
      {label}
    </Button>
  );
}
