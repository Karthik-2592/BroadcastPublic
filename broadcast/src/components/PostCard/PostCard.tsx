// PostCard — Renders a single post entry in the feed.
// Structure matches the wireframe: header (avatar, name, handle, time, options),
// content (title + body text), optional media placeholder, and footer (like/comment/share).

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import type { MockPost } from '../../data/mockData';

interface PostCardProps {
  post: MockPost;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* -- Post Header: avatar, author info, timestamp, options -- */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
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

          <Box sx={{ ml: 1.5, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.88rem' }}>
              {post.author.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {post.author.handle} · {post.timestamp}
            </Typography>
          </Box>

          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <BookmarkBorderIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* -- Post Title -- */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {post.title}
        </Typography>

        {/* -- Post Body Text -- */}
        <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.65 }}>
          {post.content}
        </Typography>

        {/* -- Optional Media Placeholder -- */}
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

        {/* -- Tags -- */}
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

      {/* -- Post Footer: interaction buttons -- */}
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
        <ActionButton icon={<FavoriteBorderIcon />} label={post.likes.toString()} />
        <ActionButton icon={<ChatBubbleOutlineIcon />} label={post.comments.toString()} />
        <ActionButton icon={<ShareOutlinedIcon />} label={post.shares.toString()} />
      </CardActions>
    </Card>
  );
}

// Small reusable button for post actions (like, comment, share)
function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box
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
        {icon}
      </IconButton>
      <Typography variant="caption" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}
