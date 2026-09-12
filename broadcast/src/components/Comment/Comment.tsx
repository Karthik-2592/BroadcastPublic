// Comment — Thread-style inline comment row used inside CommentsSection.
// Layout: avatar column (with vertical thread-line) | content column.
// Includes an embedded Reply toggle that shows/hides the Reply component.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Reply, { EditedIndicator } from '../Reply/Reply';
import type { Comment as ApiComment } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { useToggleCommentLike } from '../../queries/comments';
import { useUpdateComment, useDeleteComment } from '../../queries/comments';

interface CommentProps {
  comment: ApiComment;
  /** Indent level — 0 for top-level, 1 for nested replies */
  depth?: number;
  canEdit?: boolean;
  communityAdminId?: string | null;
  inPost?: boolean;
  onLoadReplies?: (cursor?: string | null) => Promise<void>;
  repliesLoading?: boolean;
  repliesCursor?: string | null;
  onReplySubmitting?: () => void;
  onReplySubmissionFailed?: () => void;
  onReplyCreated?: (reply: ApiComment) => void;
  initialLiked?: boolean;
}

function CommentEditDialog({ comment, open, onClose }: { comment: ApiComment; open: boolean; onClose: () => void }) {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState(comment.content);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const COMMENT_MAX = 200;
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  useEffect(() => {
    if (open) setCommentText(comment.content);
  }, [open, comment]);

  const handleEdit = async () => {
    if (!commentText.trim() || commentText.length > COMMENT_MAX) return;
    try {
      await updateComment.mutateAsync({ commentId: comment.id, content: commentText });
      onClose();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync(comment.id);
      setIsDeleteOpen(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableScrollLock={true}>
        <DialogContent sx={{ p: 0, bgcolor: '#1a1a2e', color: 'text.primary' }}>
          <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #b388ff, transparent)' }} />
          <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit comment</Typography>
            <IconButton aria-label="Close edit comment" onClick={onClose} sx={{ color: 'text.secondary' }}><CloseRoundedIcon /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 3 }}>
            <Avatar src={currentUser?.profile_picture?.media_url ?? undefined} sx={{ width: 40, height: 40, bgcolor: 'primary.main', color: '#ffffff', fontWeight: 700, fontSize: '1.2rem' }}>{currentUser?.profile_name?.charAt(0) ?? currentUser?.username?.charAt(0) ?? '?'}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="textarea"
                  rows={4}
                  value={commentText}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(event.target.value)}
                  sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 1.5, p: 1.5, pb: '28px', color: 'text.primary', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.65, resize: 'none', outline: 'none', '&:focus': { borderColor: 'rgba(179,136,255,0.5)' } }}
                />
                <Typography component="span" sx={{ position: 'absolute', bottom: 5, right: 6, fontSize: '0.68rem', color: commentText.length > COMMENT_MAX ? 'error.main' : 'text.disabled', bgcolor: 'rgba(0,0,0,0.35)', borderRadius: 9999, px: 0.75, py: 0.15, pointerEvents: 'none' }}>
                  {commentText.length}/{COMMENT_MAX}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button color="error" variant="outlined" size="small" onClick={() => setIsDeleteOpen(true)} disabled={deleteComment.isPending}>Delete</Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={onClose} sx={{ color: 'text.secondary' }} disabled={updateComment.isPending || deleteComment.isPending}>Cancel</Button>
                  <Button size="small" variant="contained" onClick={handleEdit} disabled={updateComment.isPending}>Edit</Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} maxWidth="xs" fullWidth disableScrollLock={true}>
        <DialogContent sx={{ p: 4, bgcolor: '#1a1a2e' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Delete comment?</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>This action cannot be undone. Are you sure you want to delete this comment?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>Confirm delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Comment({ comment, depth = 0, canEdit = false, communityAdminId = null, onLoadReplies, repliesLoading = false, repliesCursor = null, inPost = true, onReplySubmitting, onReplySubmissionFailed, onReplyCreated, initialLiked }: CommentProps) {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleCommentLike = useToggleCommentLike();

  const [isLiked, setIsLiked] = useState(initialLiked ?? comment.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(comment.favorite_count);
  const author = comment.user_summary;
  const canManageComment = Boolean(canEdit || (communityAdminId && currentUser?.id && communityAdminId === currentUser.id));

  useEffect(() => {
    if (!isAuthenticated) { setIsLiked(false); return; }
    if (initialLiked !== undefined) setIsLiked(initialLiked);
  }, [initialLiked, isAuthenticated]);

  const avatarSize = depth === 0 ? 40 : 32;
  const isNested = depth > 0;

  const handleNavigateProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author?.id) {
      navigate(`/profile/${author.id}`);
      return;
    }
    navigate(isAuthenticated ? '/login' : '/login');
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

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((current) => current + (next ? 1 : -1));
    toggleCommentLike.mutate({ postId: comment.post_id, commentId: comment.id, liked: next }, {
      onError: () => {
        setIsLiked(next === false);
        setLikeCount((current) => current - (next ? 1 : -1));
      },
    });
  };

  const handleToggleReplies = async () => {
    if (repliesOpen) {
      setRepliesOpen(false);
      return;
    }

    await onLoadReplies?.();
    setRepliesOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Thread row */}
      <Box sx={{ display: 'flex', gap: 2, ml: isNested ? 4 : 0 }}>
        {/* Avatar column with vertical thread-line */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <Avatar
            src={author?.profile_picture ?? undefined}
            onClick={handleNavigateProfile}
            sx={{
              width: avatarSize,
              height: avatarSize,
              color:'white',
              bgcolor: '#7c4dff',
              fontSize: isNested ? '0.95rem' : '1.2rem',
              fontWeight: 600,
              border: isNested ? '2px solid rgba(179, 136, 255, 0.3)' : 'none',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            {(author?.profile_name ?? author?.username ?? '?').charAt(0)}
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
                {author?.profile_name ?? author?.username ?? 'Unknown'}
              </Typography>
              {!isNested && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  @{author?.username ?? 'unknown'}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                • {comment.timestamp}<EditedIndicator edited={Boolean(comment.last_edited_at)} />
              </Typography>
            </Box>
            <IconButton
              size="small"
              aria-label="Comment options"
              onClick={(event) => { event.stopPropagation(); setOptionsAnchor(event.currentTarget); }}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Menu anchorEl={optionsAnchor}
            open={Boolean(optionsAnchor)}
            onClose={() => setOptionsAnchor(null)}
            disableScrollLock={true}
          >
            <MenuItem onClick={handleReport}
              sx={{
                fontSize: '0.84rem',
                color: 'error.light',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
              }}>
              <FlagOutlinedIcon fontSize="small" /> Report
            </MenuItem>
            {canManageComment && (
              <MenuItem onClick={() => { setOptionsAnchor(null); setIsEditOpen(true); }} sx={{
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
          <CommentEditDialog comment={comment} open={isEditOpen} onClose={() => setIsEditOpen(false)} />

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
              onClick={handleToggleLike}
              startIcon={isLiked ? <ThumbUpIcon sx={{ fontSize: 15 }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                color: isLiked ? 'secondary.main' : 'text.secondary',
                bgcolor: isLiked ? 'rgba(105, 240, 174, 0.08)' : 'transparent',
                textTransform: 'none',
                fontSize: '0.78rem',
                fontWeight: 500,
                px: 1,
                py: 0.25,
                minWidth: 0,
                '&:hover': { color: 'secondary.main', bgcolor: 'rgba(105, 240, 174, 0.12)' },
              }}
            >
              {likeCount}
            </Button>
            {!isNested && inPost && (
              <Button
                size="small"
                startIcon={<ReplyIcon sx={{ fontSize: 15 }} />}
                onClick={() => isAuthenticated ? setReplyOpen((prev) => !prev) : navigate('/login')}
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
            )}
            {!isNested && inPost && repliesOpen && repliesCursor && (
              <Button size="small" onClick={() => void onLoadReplies?.(repliesCursor)} disabled={repliesLoading} sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.78rem', minWidth: 0 }}>
                {repliesLoading ? 'Loading replies…' : 'Load more replies'}
              </Button>
            )}
            {!isNested && inPost && (
              <Button
                size="small"
                onClick={handleToggleReplies}
                disabled={repliesLoading}
                sx={{ color: repliesOpen ? 'primary.light' : 'text.secondary', textTransform: 'none', fontSize: '0.78rem', fontWeight: 500, px: 1, py: 0.25, minWidth: 0 }}
              >
                {repliesLoading ? 'Loading replies…' : repliesOpen ? 'Hide replies' : `${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Inline reply composer — toggled by Reply button (only for top-level comments) */}
      {!isNested && (
        <Box sx={{ ml: 7 }}>
          <Reply open={replyOpen} onClose={() => setReplyOpen(false)} parentCommentId={comment.id} postId={comment.post_id} onSubmitting={onReplySubmitting} onSubmissionFailed={onReplySubmissionFailed} onSubmitted={onReplyCreated} />
        </Box>
      )}

      {/* Nested replies — restricted to depth 1 (only top-level comments can render replies) */}
      {depth === 0 && repliesOpen &&
        (comment.replies?.length ? comment.replies.map((reply) => (
          <Comment key={reply.id} comment={reply} depth={1} />
        )) : (
          <Typography sx={{ ml: 7, pb: 2, color: 'text.secondary', fontSize: '0.8rem' }}>
            No replies so far
          </Typography>
        ))}
    </Box>
  );
}
