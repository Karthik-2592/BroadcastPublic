import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Comment from '../Comment/Comment';
import type { Comment as ApiComment } from '../../types/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FetchErrorDialog from '../FetchErrorDialog';
import { BASE_URL } from '../../config';

interface CommentsSectionProps {
  comments?: ApiComment[];
  postId?: string;
}

const COMMENT_MAX = 200;
const INITIAL_REPLIES_LIMIT = 5;

export default function CommentsSection({ comments = [], postId }: CommentsSectionProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loadedReplies, setLoadedReplies] = useState<Record<string, ApiComment[]>>({});
  const [replyCursors, setReplyCursors] = useState<Record<string, string | null>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [visibleComments, setVisibleComments] = useState<ApiComment[]>(comments);
  const [commentsCursor, setCommentsCursor] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasFetchError, setHasFetchError] = useState(false);

  const loadComments = useCallback(async (nextCursor?: string | null) => {
    if (!postId) return;
    setLoadingComments(true);
    try {
      const query = nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : '';
      const response = await fetch(`${BASE_URL}/posts/${postId}/comments${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load comments');
      const body = await response.json() as { data?: ApiComment[]; cursor?: string };
      const page = body.data ?? [];
      setVisibleComments((current) => nextCursor ? [...current, ...page] : page);
      setCommentsCursor(body.cursor === 'null' ? null : body.cursor ?? null);
    } catch {
      setHasFetchError(true);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    setVisibleComments(comments);
    setCommentsCursor(null);
    if (postId) void loadComments();
  }, [comments, loadComments, postId]);

  const loadReplies = useCallback(async (comment: ApiComment, nextCursor?: string | null) => {
    if ((!nextCursor && loadedReplies[comment.id]) || loadingReplies[comment.id]) return;

    setLoadingReplies((current) => ({ ...current, [comment.id]: true }));

    try {
      const query = nextCursor ? `&cursor=${encodeURIComponent(nextCursor)}` : '';
      const response = await fetch(`${BASE_URL}/comments/${comment.id}/replies?limit=${INITIAL_REPLIES_LIMIT}${query}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Unable to load replies');

      const payload = await response.json() as { data?: ApiComment[]; cursor?: string } | ApiComment[];
      const replies = Array.isArray(payload) ? payload : payload.data ?? [];
      setLoadedReplies((current) => ({ ...current, [comment.id]: nextCursor ? [...(current[comment.id] ?? []), ...replies] : replies.slice(0, INITIAL_REPLIES_LIMIT) }));
      if (!Array.isArray(payload)) setReplyCursors((current) => ({ ...current, [comment.id]: payload.cursor === 'null' ? null : payload.cursor ?? null }));
    } catch {
      setHasFetchError(true);
      setLoadedReplies((current) => ({ ...current, [comment.id]: nextCursor ? current[comment.id] ?? [] : [] }));
      setReplyCursors((current) => ({ ...current, [comment.id]: null }));
    } finally {
      setLoadingReplies((current) => ({ ...current, [comment.id]: false }));
    }
  }, [loadedReplies, loadingReplies]);

  const debouncedSubmitCommentApi = useCallback(
    debounce((text: string) => {
      void text;
    }, 500),
    []
  );

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    if (commentText.length > COMMENT_MAX) {
      setCommentError(`Comment must be ${COMMENT_MAX} characters or fewer.`);
      return;
    }
    setCommentError('');
    debouncedSubmitCommentApi(commentText);
    setCommentText('');
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {/* ── Comment Submit Section ── */}
      {isAuthenticated ? <Box
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
          {/* Textarea with char-count chip */}
          <Box sx={{ position: 'relative' }}>
            <Box
              component="textarea"
              placeholder="Add to the discussion..."
              rows={2}
              value={commentText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
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
                bottom: 6,
                right: 8,
                fontSize: '0.68rem',
                fontWeight: 600,
                color: commentText.length > COMMENT_MAX ? 'error.main' : 'text.disabled',
                bgcolor: 'rgba(0,0,0,0.35)',
                borderRadius: 9999,
                px: 0.75,
                py: 0.15,
                lineHeight: 1.6,
                pointerEvents: 'none',
                transition: 'color 0.2s',
              }}
            >
              {commentText.length}/{COMMENT_MAX}
            </Typography>
          </Box>
          {/* Inline error */}
          {commentError && (
            <Typography variant="caption" sx={{ color: 'error.main', mt: -1, fontSize: '0.75rem' }}>
              {commentError}
            </Typography>
          )}

          {/* Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleSubmitComment}
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
              Comment
            </Button>
          </Box>
        </Box>
      </Box> : (
        <Button variant="outlined" onClick={() => navigate('/login')} sx={{ alignSelf: 'stretch', py: 2, borderRadius: 3, textTransform: 'none' }}>
          Log in to join the discussion
        </Button>
      )}

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
        {visibleComments.length === 0 ? (
          <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            Be the first to comment
          </Typography>
        ) : visibleComments.map((comment) => (
          <Comment
            key={comment.id}
            comment={{ ...comment, replies: loadedReplies[comment.id] }}
            onLoadReplies={(nextCursor) => loadReplies(comment, nextCursor)}
            repliesCursor={replyCursors[comment.id] ?? null}
            repliesLoading={loadingReplies[comment.id] ?? false}
          />
        ))}
      </Box>

      {/* ── Load more button ── */}
      {commentsCursor && <Button
        fullWidth
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={() => void loadComments(commentsCursor)}
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
        {loadingComments ? <CircularProgress size={18} /> : 'Load more comments'}
      </Button>}
      <FetchErrorDialog open={hasFetchError} onClose={() => setHasFetchError(false)} />
    </Box>
  );
}
