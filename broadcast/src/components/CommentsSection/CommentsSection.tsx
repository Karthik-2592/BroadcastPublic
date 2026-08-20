import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Comment from '../Comment/Comment';
import type { MockComment } from '../../data/mockData';
import { mockComments } from '../../data/mockData';

interface CommentsSectionProps {
  comments?: MockComment[];
}

export default function CommentsSection({ comments = mockComments }: CommentsSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {/* ── Comment Submit Section ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          p: 2.5,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Current-user avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: '#0f0f1a',
            fontWeight: 700,
            fontSize: '0.9rem',
            flexShrink: 0,
            border: '1px solid rgba(179, 136, 255, 0.3)',
          }}
        >
          Y
        </Avatar>

        {/* Input area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            component="textarea"
            placeholder="Add to the discussion..."
            rows={2}
            sx={{
              width: '100%',
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 1.5,
              p: 1.5,
              color: 'text.primary',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              lineHeight: 1.65,
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s, background 0.2s',
              '&:focus': {
                borderColor: 'rgba(179, 136, 255, 0.5)',
                bgcolor: 'rgba(179, 136, 255, 0.04)',
              },
              '&::placeholder': { color: 'text.disabled' },
            }}
          />

          {/* Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' } }}
              >
                <FormatBoldIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' } }}
              >
                <CodeIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(179,136,255,0.08)' } }}
              >
                <LinkIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Button
              size="small"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: 4,
                px: 2.5,
                py: 0.75,
                boxShadow: '0 2px 10px rgba(179,136,255,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a98bda 0%, #7452d1 100%)',
                  boxShadow: '0 4px 16px rgba(179,136,255,0.4)',
                },
              }}
            >
              Reply
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Comments header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.95rem' }}
        >
          Comments
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'primary.light',
            bgcolor: 'rgba(179, 136, 255, 0.12)',
            px: 1,
            py: 0.25,
            borderRadius: 4,
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          {comments.length + comments.reduce((acc, c) => acc + (c.replies?.length ?? 0), 0)}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mt: -2 }} />

      {/* ── Comment threads list ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </Box>

      {/* ── Load more button ── */}
      <Button
        fullWidth
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        sx={{
          borderColor: 'rgba(255,255,255,0.1)',
          color: 'text.secondary',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.85rem',
          borderRadius: 2,
          py: 1.25,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            color: 'primary.light',
            bgcolor: 'rgba(179, 136, 255, 0.06)',
            '& .MuiButton-endIcon': { transform: 'translateY(2px)' },
          },
          '& .MuiButton-endIcon': { transition: 'transform 0.2s ease' },
        }}
      >
        Load more comments
      </Button>
    </Box>
  );
}
