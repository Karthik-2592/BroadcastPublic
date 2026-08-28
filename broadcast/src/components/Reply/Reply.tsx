import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';

interface ReplyProps {
  open: boolean;
  onClose?: () => void;
}

export default function Reply({ open, onClose }: ReplyProps) {
  const [replyText, setReplyText] = useState('');

  const debouncedSubmitReplyApi = useCallback(
    debounce((text: string) => {
      console.log(`[API MOCK] Submitted reply:`, text);
    }, 500),
    []
  );

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    debouncedSubmitReplyApi(replyText);
    setReplyText('');
    onClose?.();
  };
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
            {/* Textarea (UI only) */}
            <Box
              component="textarea"
              placeholder="Write your reply..."
              rows={3}
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              sx={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: 'text.primary',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                '&::placeholder': {
                  color: 'text.disabled',
                },
              }}
            />

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

            {/* Toolbar row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Format buttons (UI only) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
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
