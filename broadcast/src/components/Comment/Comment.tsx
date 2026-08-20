// Comment — Thread-style inline comment row used inside CommentsSection.
// Layout: avatar column (with vertical thread-line) | content column.
// Includes an embedded Reply toggle that shows/hides the Reply component.

import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import Reply from '../Reply/Reply';
import type { MockComment } from '../../data/mockData';

interface CommentProps {
  comment: MockComment;
  /** Indent level — 0 for top-level, 1 for nested replies */
  depth?: number;
}

export default function Comment({ comment, depth = 0 }: CommentProps) {
  const [replyOpen, setReplyOpen] = useState(false);

  const avatarSize = depth === 0 ? 40 : 32;
  const isNested = depth > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Thread row */}
      <Box sx={{ display: 'flex', gap: 2, ml: isNested ? 4 : 0 }}>
        {/* Avatar column with vertical thread-line */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <Avatar
            sx={{
              width: avatarSize,
              height: avatarSize,
              bgcolor: comment.author.avatarColor,
              fontSize: isNested ? '0.75rem' : '0.9rem',
              fontWeight: 600,
              border: isNested ? '2px solid rgba(179, 136, 255, 0.3)' : 'none',
              flexShrink: 0,
            }}
          >
            {comment.author.name.charAt(0)}
          </Avatar>
          {/* Vertical thread line — shown only when there are replies or reply form is open */}
          {!isNested && (comment.replies?.length || replyOpen) ? (
            <Box
              sx={{
                width: 2,
                flex: 1,
                minHeight: 16,
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.08)',
                borderRadius: 1,
              }}
            />
          ) : null}
        </Box>

        {/* Content column */}
        <Box sx={{ flex: 1, pb: 2 }}>
          {/* Author row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: isNested ? 'primary.light' : 'text.primary',
                  fontWeight: 600,
                  fontSize: isNested ? '0.82rem' : '0.9rem',
                }}
              >
                {comment.author.name}
              </Typography>
              {!isNested && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {comment.author.handle}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                • {comment.timestamp}
              </Typography>
            </Box>
            {!isNested && (
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {/* Comment body */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.65,
              fontSize: '0.88rem',
              mb: 1,
            }}
          >
            {comment.content}
          </Typography>

          {/* Action row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              size="small"
              startIcon={<ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontSize: '0.78rem',
                fontWeight: 500,
                px: 1,
                py: 0.25,
                minWidth: 0,
                '&:hover': { color: 'secondary.main', bgcolor: 'rgba(105, 240, 174, 0.08)' },
              }}
            >
              {comment.likes}
            </Button>
            <Button
              size="small"
              startIcon={<ReplyIcon sx={{ fontSize: 15 }} />}
              onClick={() => setReplyOpen((prev) => !prev)}
              sx={{
                color: replyOpen ? 'primary.light' : 'text.secondary',
                textTransform: 'none',
                fontSize: '0.78rem',
                fontWeight: 500,
                px: 1,
                py: 0.25,
                minWidth: 0,
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(179, 136, 255, 0.08)' },
              }}
            >
              Reply
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Inline reply composer — toggled by Reply button */}
      <Box sx={{ ml: depth === 0 ? 7 : 11 }}>
        <Reply open={replyOpen} onClose={() => setReplyOpen(false)} />
      </Box>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <Comment key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </Box>
  );
}
