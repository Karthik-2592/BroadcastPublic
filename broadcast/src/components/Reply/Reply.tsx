import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const REPLY_MAX = 200;

export function EditedIndicator({ edited }: { edited: boolean }) {
  return edited ? <Typography component="span"> · edited</Typography> : null;
}

interface ReplyProps {
  open: boolean;
  onClose?: () => void;
  parentCommentId?: string;
}

export default function Reply({ open, onClose, parentCommentId }: ReplyProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');

  const debouncedSubmitReplyApi = useCallback(
    debounce((text: string) => {
      void { parentCommentId, text };
    }, 500),
    []
  );

  const handleSubmitReply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;
    if (replyText.length > REPLY_MAX) {
      setReplyError(`Reply must be ${REPLY_MAX} characters or fewer.`);
      return;
    }
    setReplyError('');
    debouncedSubmitReplyApi(replyText);
    setReplyText('');
    onClose?.();
  };

  const isOverLimit = replyText.length > REPLY_MAX;

  return (
    <Collapse in={open} unmountOnExit>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          bgcolor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 2,
          p: 2,
          mb: 2,
          transformOrigin: 'top',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(179, 136, 255, 0.07)',
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {/* Current user avatar placeholder */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              color: '#0f0f1a',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Y
          </Avatar>

          {/* Composer area */}
          <Box sx={{ flex: 1 }}>
            {/* Textarea with char-count chip */}
            <Box sx={{ position: 'relative' }}>
              <Box
                component="textarea"
                placeholder="Write your reply..."
                rows={3}
                value={replyText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                sx={{
                  width: '100%',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 1.5,
                  p: 1.5,
                  pb: '28px', // room for char-count chip
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
              {/* Character count chip */}
              <Typography
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: isOverLimit ? 'error.main' : 'text.disabled',
                  bgcolor: 'rgba(0,0,0,0.35)',
                  borderRadius: 9999,
                  px: 0.75,
                  py: 0.15,
                  lineHeight: 1.6,
                  pointerEvents: 'none',
                  transition: 'color 0.2s',
                }}
              >
                {replyText.length}/{REPLY_MAX}
              </Typography>
            </Box>

            {/* Inline error */}
            {replyError && (
              <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
                {replyError}
              </Typography>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

            {/* Toolbar row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onClose && (
                  <Button
                    size="small"
                    onClick={onClose}
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      borderRadius: 4,
                      px: 1.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSubmitReply}
                  sx={{
                    background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: 4,
                    px: 2,
                    boxShadow: '0 2px 8px rgba(179,136,255,0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #a98bda 0%, #7452d1 100%)',
                      boxShadow: '0 4px 14px rgba(179,136,255,0.4)',
                    },
                  }}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
}
