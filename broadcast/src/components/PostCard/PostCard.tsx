// PostCard — Renders a post entry in either 'compact' (feed/explore/profile) or 'expanded' (post view) variant.
// Supports toggleable Like/Bookmark states, author profile routing, and an Options dropdown with a Report action.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Input from '@mui/material/Input';
import TextField from '@mui/material/TextField';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { Post } from '../../types/api';
import { EditedIndicator } from '../Reply/Reply';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';

function PostMediaCarousel({ media, placeholder, height }: { media?: unknown[]; placeholder?: string; height: number }) {
  const mediaItems = (media ?? []).map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const value = item as Record<string, unknown>;
      return typeof value.media_url === 'string' ? value.media_url : typeof value.url === 'string' ? value.url : typeof value.path === 'string' ? value.path : null;
    }
    return null;
  }).filter((item): item is string => Boolean(item));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeMedia = mediaItems[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [mediaItems.length]);

  if (!activeMedia && !placeholder) return null;

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 1.5,
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: activeMedia ? 'pointer' : 'default',
        }}
      >
        <Box
          component={activeMedia ? 'img' : 'div'}
          src={activeMedia}
          alt="Post media"
          onClick={(event: React.MouseEvent) => {
            if (!activeMedia) return;
            event.stopPropagation();
            setIsPreviewOpen(true);
          }}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', background: activeMedia ? undefined : placeholder, display: 'block' }}
        />
        {mediaItems.length > 1 && (
          <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.75, px: 1, py: 0.75, borderRadius: 9999, bgcolor: 'rgba(0,0,0,0.45)' }}>
            {mediaItems.map((item, index) => (
              <Box
                key={`${item}-${index}`}
                component="button"
                type="button"
                aria-label={`Show media ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={(event) => { event.stopPropagation(); setActiveIndex(index); }}
                sx={{ width: 8, height: 8, p: 0, minWidth: 0, border: 0, borderRadius: '50%', cursor: 'pointer', bgcolor: index === activeIndex ? 'primary.light' : 'rgba(255,255,255,0.55)', transition: 'transform 0.15s, background-color 0.15s', '&:hover': { transform: 'scale(1.25)' } }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        disableScrollLock={true}
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)' } },
          paper: { sx: { m: 2, bgcolor: '#0f1117', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' } },
        }}
      >
        <IconButton
          aria-label="Close media preview"
          onClick={(e) => {
            e.stopPropagation();
            setIsPreviewOpen(false);
          }}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.35)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f1117' }}>
          {activeMedia && (
            <Box
              component="img"
              src={activeMedia}
              alt="Expanded post media"
              sx={{
                display: 'block',
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                backgroundColor: '#0f1117',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PostEditDialog({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.content);
  const [tagsText, setTagsText] = useState(post.tags.join(' '));
  const [tags, setTags] = useState<string[]>(post.tags);
  const [tagError, setTagError] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleOpen = () => {
    setTitle(post.title);
    setBody(post.content);
    setTagsText(post.tags.filter((tag) => tag.startsWith('#')).join(' '));
    setTags(post.tags.filter((tag) => tag.startsWith('#')));
    setTagError(false);
  };

  useEffect(() => {
    if (open) handleOpen();
  }, [open, post]);

  const handleTagsProcess = () => {
    if (!tagsText.trim()) {
      setTagError(false);
      return;
    }
    if (!/^[a-zA-Z0-9#\s]*$/.test(tagsText)) {
      setTagError(true);
      return;
    }
    setTagError(false);
    const matches = tagsText.match(/#\w+/g) || [];
    setTags([...new Set(matches)]);
  };

  const handleTagsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTagsProcess();
    }
  };

  const handleEdit = async () => {
    handleTagsProcess();
    await fetch(`${BASE_URL}/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content: body, tags }),
      credentials: 'include',
    }).catch(() => undefined);
    onClose();
  };

  const handleDelete = async () => {
    await fetch(`${BASE_URL}/posts/${post.id}`, { method: 'DELETE', credentials: 'include' }).catch(() => undefined);
    setIsDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        disableScrollLock={true}
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'brightness(0.5) blur(4px)' } },
          paper: { sx: { width: '100%', maxWidth: 720, bgcolor: '#1a1a2e', color: 'text.primary', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', m: 2, overflow: 'hidden' } },
        }}
      >
        <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #b388ff, transparent)' }} />
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit post</Typography>
          <IconButton aria-label="Close edit post" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: { xs: 3, md: 4 } }}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, 75))}
            sx={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: 'text.primary',
              mb: 4,
              '& .MuiInputBase-input': {
                border: '1px solid rgba(255,255,255,0.23)',
                borderRadius: 60,
              }
            }}
          />
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2,
            bgcolor: 'rgba(31,18,36,0.53)',
            border: '1px solid rgba(255, 255, 255, 0.23)',
            borderRadius: 10, px: 2.5, py: 1, mb: 3
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Community</Typography>
            <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(31,19,36,0.53)', borderRadius: '60px', border: '1px solid rgba(255, 255, 255, 0.45)' }} />
            <TextField
              value="Global"
              disabled
              variant="standard"
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                  fontSize: '0.9rem',
                  fontWeight: 500
                },
                '& .MuiInput-root:before, & .MuiInput-root:after': { display: 'none' }
              }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              label="Body"
              multiline
              minRows={6}
              value={body}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setBody(event.target.value.slice(0, 300))
              }
              variant="outlined"
              fullWidth
              sx={{
                background: 'rgba(31, 19, 36, 0.53)',
                borderRadius: 4,
                '& .MuiOutlinedInput-root': {
                  padding: '16px 20px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  lineHeight: 1.85,
                  color: 'inherit',
                  resize: 'none',
                  borderRadius: 4,
                  mb: 4
                },
                '& .MuiFormLabel-root': {
                  fontSize: "1.2rem",
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3, ml: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tags</Typography>
              <Input fullWidth value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                onKeyDown={handleTagsKeyDown}
                onBlur={handleTagsProcess}
                placeholder="#tag1 #tag2..."
                disableUnderline
                sx={{
                  color: 'text.primary',
                  fontSize: '0.85rem',
                  border: tagError ? '1px solid #ef5350' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  width: '100%',
                  transition: 'border 0.2s',
                  '&:focus-within': {
                    border: tagError ? '1px solid #ef5350' : '1px solid rgba(179,136,255,0.5)'
                  }
                }} />
            </Box>
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {tags.map((tag) => <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary', fontSize: '0.8rem' }} />)}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', pt: 3 }}>
            <Button color="error" variant="outlined" onClick={() => setIsDeleteOpen(true)}>Delete</Button>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={onClose}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit}>Edit</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 4, bgcolor: '#1a1a2e' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Delete post?</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>This action cannot be undone. Are you sure you want to delete this post?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>Confirm delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PostCardProps {
  post: Post;
  variant?: 'compact' | 'expanded';
  canEdit?: boolean;
  communityAdminId?: string | null;
}

export default function PostCard({ post, variant = 'compact', canEdit = false, communityAdminId = null }: PostCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.favorite_count);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isExpanded = variant === 'expanded';
  const author = post.user_summary;
  const canManagePost = Boolean(canEdit || (communityAdminId && currentUser?.id && communityAdminId === currentUser.id));

  useEffect(() => {
    if (!isAuthenticated) { setIsLiked(false); setIsBookmarked(false); return; }
    void Promise.all([
      fetch(`${BASE_URL}/posts/${post.id}/likes/status`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null),
      fetch(`${BASE_URL}/posts/${post.id}/saves/status`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null),
    ]).then(([like, save]: Array<{ data?: { active?: boolean } } | null>) => {
      setIsLiked(Boolean(like?.data?.active));
      setIsBookmarked(Boolean(save?.data?.active));
    });
  }, [isAuthenticated, post.id]);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((current) => current + (next ? 1 : -1));
    void fetch(`${BASE_URL}/posts/likes`, { method: next ? 'POST' : 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: post.id }), credentials: 'include' })
      .then((response) => { if (!response.ok) throw new Error('Unable to update like') })
      .catch(() => {
        setIsLiked(next === false);
        setLikeCount((current) => current - (next ? 1 : -1));
      });
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const next = !isBookmarked;
    setIsBookmarked(next);
    void fetch(`${BASE_URL}/posts/saves`, { method: next ? 'POST' : 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: post.id }), credentials: 'include' })
      .then((response) => { if (!response.ok) throw new Error('Unable to update bookmark'); })
      .catch(() => setIsBookmarked(next === false));
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/placeholder');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsAnchor(null);
    setIsEditOpen(true);
  };

  const handleNavigateProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author?.id) {
      navigate(`/profile/${author.id}`);
      return;
    }
    navigate(isAuthenticated ? '/login' : '/placeholder');
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
                  src={author?.profile_picture ?? undefined}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: author?.avatarColor ?? '#7c4dff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: '2px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {(author?.profile_name ?? author?.username ?? '?').charAt(0)}
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
                  {author?.profile_name ?? author?.username ?? 'Unknown'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                  @{author?.username ?? 'unknown'} ◈ {post.time_created}
                  <EditedIndicator edited={Boolean(post.last_edited_at)} />
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

            <PostMediaCarousel media={post.media} placeholder={post.mediaPlaceholder} height={240} />

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
          {canManagePost && (
            <MenuItem onClick={handleEdit} sx={{
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
            }}>
              <EditOutlinedIcon fontSize="small"
                sx={{
                  '&:hover': { color: 'primary.light' },
                }}
              />
              Edit
            </MenuItem>
          )}
        </Menu>
        <PostEditDialog post={post} open={isEditOpen} onClose={() => setIsEditOpen(false)} />
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
            <Box onClick={handleNavigateProfile} sx={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <Avatar
                src={author?.profile_picture ?? undefined}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: author?.avatarColor ?? '#7c4dff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {(author?.profile_name ?? author?.username ?? '?').charAt(0)}
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
                  {author?.profile_name ?? author?.username ?? 'Unknown'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  @{author?.username ?? 'unknown'} ◈ {post.time_created}
                  <EditedIndicator edited={Boolean(post.last_edited_at)} />
                </Typography>
              </Box>

              {post.recommendationReason && (
                <Typography variant="caption" sx={{ display: 'block', color: 'secondary.light', fontSize: '0.72rem', textAlign: 'right', mt: 0.5 }}>
                  {post.recommendationReason}
                </Typography>
              )}
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

          <PostMediaCarousel media={post.media} placeholder={post.mediaPlaceholder} height={220} />
        </Box>

        {/* Tags */}
        {post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <Chip
                key={tag}
                label={`${tag}`}
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
            {post.comment_count}
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
        {canManagePost && (
          <MenuItem onClick={handleEdit} sx={{
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.8,
            '&:hover': { bgcolor: 'rgba(180, 136, 255, 0.1)' },

          }}>
            <EditOutlinedIcon fontSize="small" />
            Edit
          </MenuItem>
        )}
      </Menu>
      <PostEditDialog post={post} open={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </Card >
  );
}
