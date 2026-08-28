// PostCard — Renders a post entry in either 'compact' (feed/explore/profile) or 'expanded' (post view) variant.
// Supports toggleable Like/Bookmark states, author profile routing, and an Options dropdown with a Report action.

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import type { MockPost } from '../../data/mockData';

interface PostCardProps {
  post: MockPost;
  variant?: 'compact' | 'expanded';
}

export default function PostCard({ post, variant = 'compact' }: PostCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null);

  const isExpanded = variant === 'expanded';

  // Debounced API callbacks for mock server interaction
  const debouncedLikeApi = useCallback(
    debounce((postId: string, newLikedState: boolean) => {
      console.log(`[API MOCK] Post ${postId} liked: ${newLikedState}`);
    }, 250),
    []
  );

  const debouncedBookmarkApi = useCallback(
    debounce((postId: string, newBookmarkState: boolean) => {
      console.log(`[API MOCK] Post ${postId} bookmarked: ${newBookmarkState}`);
    }, 250),
    []
  );

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      debouncedLikeApi(post.id, next);
      return next;
    });
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked((prev) => {
      const next = !prev;
      debouncedBookmarkApi(post.id, next);
      return next;
    });
  };

  const handleOpenOptions = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOptionsAnchor(e.currentTarget);
  };

  const handleCloseOptions = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOptionsAnchor(null);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsAnchor(null);
    navigate('/placeholder');
  };

  const handleNavigateProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/profile');
  };

  // ─── EXPANDED VARIANT (PostViewPage) ─────────────────────────────────────────
  if (isExpanded) {
    return (
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
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
              onClick={handleNavigateProfile}
            >
              <Box>
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
              </Box>
              <Box

              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    transition: 'color 0.15s ease',
                    '&:hover': { color: 'primary.light' },
                  }}
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
              onClick={handleOpenOptions}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' },
              }}
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
            <Button
              size="small"
              onClick={handleToggleLike}
              startIcon={
                isLiked ? (
                  <FavoriteIcon sx={{ fontSize: 20, color: '#ef5350' }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                )
              }
              sx={{
                color: isLiked ? '#ef9a9a' : 'text.secondary',
                bgcolor: isLiked ? 'rgba(244, 67, 54, 0.12)' : 'transparent',
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
                  bgcolor: 'rgba(244, 67, 54, 0.15)',
                  color: '#ef9a9a',
                },
              }}
            >
              {likeCount}
            </Button>

            <Button
              size="small"
              startIcon={<ShareOutlinedIcon sx={{ fontSize: 20, ml: 0.5 }} />}
              sx={{
                color: 'text.secondary',
                bgcolor: 'transparent',
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
                  bgcolor: 'rgba(105, 240, 174, 0.1)',
                  color: '#69f0ae',
                },
              }}
            >
            </Button>

            <Box sx={{ flex: 1 }} />

            <IconButton
              size="small"
              onClick={handleToggleBookmark}
              sx={{
                color: isBookmarked ? 'primary.light' : 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' },
              }}
            >
              {isBookmarked ? (
                <BookmarkIcon sx={{ fontSize: 20, color: 'primary.light' }} />
              ) : (
                <BookmarkBorderIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Options Dropdown Menu */}
        <Menu
          anchorEl={optionsAnchor}
          open={Boolean(optionsAnchor)}
          onClose={() => handleCloseOptions()}
          onClick={(e) => e.stopPropagation()}
          disableScrollLock={true}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#1a1a2e',
                color: 'text.primary',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                minWidth: 130,
                py: 0.5,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={handleReport}
            sx={{
              fontSize: '0.84rem',
              color: 'error.light',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
            }}
          >
            <FlagOutlinedIcon fontSize="small" />
            Report
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // ─── COMPACT VARIANT (Feed / Explore / Profile) ──────────────────────────────
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Post Header: avatar, author info, timestamp, options */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', flex: 1, }}
          >
            <Box onClick={handleNavigateProfile} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: post.author.avatarColor,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {post.author.name.charAt(0)}
              </Avatar>

              <Box sx={{ ml: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  {post.author.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {post.author.handle} · {post.timestamp}
                </Typography>
              </Box>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={handleOpenOptions}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' } }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Clickable content area: title, body, media → navigates to post view */}
        <Box
          onClick={() => navigate(`/post/${post.id}`)}
          sx={{ cursor: 'pointer' }}
        >
          {/* Post Title */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {post.title}
          </Typography>

          {/* Post Body Text */}
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.65 }}>
            {post.content}
          </Typography>

          {/* Optional Media Placeholder */}
          {post.mediaPlaceholder && (
            <Box
              sx={{
                width: '100%',
                height: 220,
                borderRadius: 2,
                background: post.mediaPlaceholder,
                mb: 1.5,
              }}
            />
          )}
        </Box>

        {/* Tags */}
        {post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
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
                  '&:hover': { bgcolor: 'rgba(179,136,255,0.08)' },
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      {/* Post Footer: interaction buttons with right-aligned bookmark */}
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
        {/* Like Button */}
        <Box
          onClick={handleToggleLike}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mr: 2,
            cursor: 'pointer',
            color: isLiked ? '#ef5350' : 'text.secondary',
            transition: 'color 0.15s ease',
            '&:hover': { color: '#ef5350' },
          }}
        >
          <IconButton size="small" sx={{ color: 'inherit', p: 0.5 }}>
            {isLiked ? (
              <FavoriteIcon fontSize="small" sx={{ color: '#ef5350' }} />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="caption" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
            {likeCount}
          </Typography>
        </Box>

        {/* Comment Button (navigates to post view) */}
        <Box
          onClick={() => navigate(`/post/${post.id}`)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mr: 2,
            cursor: 'pointer',
            color: 'text.secondary',
            transition: 'color 0.15s ease',
            '&:hover': { color: 'primary.light' },
          }}
        >
          <IconButton size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
            {post.comments}
          </Typography>
        </Box>

        {/* Share Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            color: 'text.secondary',
            transition: 'color 0.15s ease',
            '&:hover': { color: '#69f0ae' },
          }}
        >
          <IconButton size="small" sx={{ color: 'inherit' }}>
            <ShareOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>

        </Box>

        {/* Right-aligned Bookmark Button */}
        <IconButton
          size="small"
          onClick={handleToggleBookmark}
          sx={{
            color: isBookmarked ? 'primary.light' : 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' },
            alignSelf: 'flex-end'
          }}
          style={{
            marginLeft: 'auto'
          }}
        >
          {isBookmarked ? (
            <BookmarkIcon fontSize="small" sx={{ color: 'primary.light' }} />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </CardActions>

      {/* Options Dropdown Menu */}
      <Menu
        anchorEl={optionsAnchor}
        open={Boolean(optionsAnchor)}
        onClose={() => handleCloseOptions()}
        onClick={(e) => e.stopPropagation()}
        disableScrollLock={true}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#1a1a2e',
              color: 'text.primary',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              minWidth: 130,
              py: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={handleReport}
          sx={{
            fontSize: '0.84rem',
            color: 'error.light',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.8,
            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
          }}
        >
          <FlagOutlinedIcon fontSize="small" />
          Report
        </MenuItem>
      </Menu>
    </Card >
  );
}

