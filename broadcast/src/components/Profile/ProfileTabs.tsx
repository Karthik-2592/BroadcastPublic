import { useEffect, useState, useCallback, type SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import PostCard from '../PostCard/PostCard';
import type { Comment as ApiComment, Post as ApiPost, RelationStatusMap } from '../../types/api';
import CommentRow from '../Comment/Comment';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';

interface ProfileTabsProps {
  userId?: string;
  sessionUserId?: string;
}

interface TabState<T> {
  items: T[];
  cursor: string | null;
  hasLoaded: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

const initialTabState = <T,>(): TabState<T> => ({
  items: [],
  cursor: null,
  hasLoaded: false,
  loading: false,
  loadingMore: false,
  error: null,
});

export default function ProfileTabs({ userId = 'user_1', sessionUserId = 'user_1' }: ProfileTabsProps) {
  const { isAuthenticated } = useAuth();
  const isOwner = Boolean(isAuthenticated && userId && sessionUserId && userId === sessionUserId);
  const canViewPrivateTabs = isAuthenticated && isOwner;

  const [activeTab, setActiveTab] = useState(0);

  const [postsState, setPostsState] = useState<TabState<ApiPost>>(initialTabState);
  const [commentsState, setCommentsState] = useState<TabState<ApiComment>>(initialTabState);
  const [savedState, setSavedState] = useState<TabState<ApiPost>>(initialTabState);

  const [postLikeStatuses, setPostLikeStatuses] = useState<RelationStatusMap>({});
  const [commentLikeStatuses, setCommentLikeStatuses] = useState<RelationStatusMap>({});

  // Reset tab states when identity (userId or ownership) changes
  const identityKey = `${userId}:${sessionUserId}:${canViewPrivateTabs}`;
  const [lastIdentity, setLastIdentity] = useState(identityKey);

  if (lastIdentity !== identityKey) {
    setLastIdentity(identityKey);
    setPostsState(initialTabState<ApiPost>());
    setCommentsState(initialTabState<ApiComment>());
    setSavedState(initialTabState<ApiPost>());
    setPostLikeStatuses({});
    setCommentLikeStatuses({});
    if (!canViewPrivateTabs && activeTab === 2) {
      setActiveTab(0);
    }
  }

  const currentTab = activeTab === 2 && !canViewPrivateTabs ? 0 : activeTab;

  const loadPosts = useCallback(
    async (cursor?: string | null) => {
      if (!userId) return;
      const isInitial = !cursor;

      setPostsState((prev) => ({
        ...prev,
        loading: isInitial,
        loadingMore: !isInitial,
        error: null,
      }));

      try {
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
        const response = await fetch(`${BASE_URL}/users/${userId}/posts${query}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Unable to load posts');
        const body = (await response.json()) as { data?: ApiPost[]; cursor?: string };
        const newPosts = Array.isArray(body.data) ? body.data : [];
        const nextCursor = body.cursor === 'null' ? null : (body.cursor ?? null);

        setPostsState((prev) => ({
          ...prev,
          items: isInitial ? newPosts : [...prev.items, ...newPosts],
          cursor: nextCursor,
          hasLoaded: true,
          loading: false,
          loadingMore: false,
          error: null,
        }));

        if (isAuthenticated && newPosts.length > 0) {
          void fetch(`${BASE_URL}/posts/likes/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: newPosts.map((p) => p.id) }),
            credentials: 'include',
          })
            .then(async (r) => (r.ok ? ((await r.json()) as { data?: RelationStatusMap }) : null))
            .then((b) => {
              if (b?.data) {
                setPostLikeStatuses((prev) => ({ ...prev, ...b.data }));
              }
            })
            .catch(() => undefined);
        }
      } catch (err) {
        setPostsState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: err instanceof Error ? err.message : 'Unable to load posts',
        }));
      }
    },
    [userId, isAuthenticated],
  );

  const loadComments = useCallback(
    async (cursor?: string | null) => {
      if (!userId) return;
      const isInitial = !cursor;

      setCommentsState((prev) => ({
        ...prev,
        loading: isInitial,
        loadingMore: !isInitial,
        error: null,
      }));

      try {
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
        const response = await fetch(`${BASE_URL}/users/${userId}/comments${query}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Unable to load comments');
        const body = (await response.json()) as { data?: ApiComment[]; cursor?: string };
        const newComments = Array.isArray(body.data) ? body.data : [];
        const nextCursor = body.cursor === 'null' ? null : (body.cursor ?? null);

        setCommentsState((prev) => ({
          ...prev,
          items: isInitial ? newComments : [...prev.items, ...newComments],
          cursor: nextCursor,
          hasLoaded: true,
          loading: false,
          loadingMore: false,
          error: null,
        }));

        if (isAuthenticated && newComments.length > 0) {
          void fetch(`${BASE_URL}/comments/likes/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: newComments.map((c) => c.id) }),
            credentials: 'include',
          })
            .then(async (r) => (r.ok ? ((await r.json()) as { data?: RelationStatusMap }) : null))
            .then((b) => {
              if (b?.data) {
                setCommentLikeStatuses((prev) => ({ ...prev, ...b.data }));
              }
            })
            .catch(() => undefined);
        }
      } catch (err) {
        setCommentsState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: err instanceof Error ? err.message : 'Unable to load comments',
        }));
      }
    },
    [userId, isAuthenticated],
  );

  const loadSavedPosts = useCallback(
    async (cursor?: string | null) => {
      if (!canViewPrivateTabs || !sessionUserId) return;
      const isInitial = !cursor;

      setSavedState((prev) => ({
        ...prev,
        loading: isInitial,
        loadingMore: !isInitial,
        error: null,
      }));

      try {
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
        const response = await fetch(`${BASE_URL}/users/${sessionUserId}/saved-posts${query}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Unable to load saved posts');
        const body = (await response.json()) as { data?: ApiPost[]; cursor?: string };
        const newSaved = Array.isArray(body.data) ? body.data : [];
        const nextCursor = body.cursor === 'null' ? null : (body.cursor ?? null);

        setSavedState((prev) => ({
          ...prev,
          items: isInitial ? newSaved : [...prev.items, ...newSaved],
          cursor: nextCursor,
          hasLoaded: true,
          loading: false,
          loadingMore: false,
          error: null,
        }));

        if (isAuthenticated && newSaved.length > 0) {
          void fetch(`${BASE_URL}/posts/likes/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: newSaved.map((p) => p.id) }),
            credentials: 'include',
          })
            .then(async (r) => (r.ok ? ((await r.json()) as { data?: RelationStatusMap }) : null))
            .then((b) => {
              if (b?.data) {
                setPostLikeStatuses((prev) => ({ ...prev, ...b.data }));
              }
            })
            .catch(() => undefined);
        }
      } catch (err) {
        setSavedState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: err instanceof Error ? err.message : 'Unable to load saved posts',
        }));
      }
    },
    [canViewPrivateTabs, sessionUserId, isAuthenticated],
  );

  // Lazy-load data when a tab first becomes active
  useEffect(() => {
    if (!userId) return;

    if (currentTab === 0) {
      if (!postsState.hasLoaded && !postsState.loading && !postsState.error) {
        void loadPosts();
      }
    } else if (currentTab === 1) {
      if (!commentsState.hasLoaded && !commentsState.loading && !commentsState.error) {
        void loadComments();
      }
    } else if (currentTab === 2 && canViewPrivateTabs) {
      if (!savedState.hasLoaded && !savedState.loading && !savedState.error) {
        void loadSavedPosts();
      }
    }
  }, [
    currentTab,
    userId,
    canViewPrivateTabs,
    postsState.hasLoaded,
    postsState.loading,
    postsState.error,
    commentsState.hasLoaded,
    commentsState.loading,
    commentsState.error,
    savedState.hasLoaded,
    savedState.loading,
    savedState.error,
    loadPosts,
    loadComments,
    loadSavedPosts,
  ]);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Tabs */}
      <Box
        sx={{
          bgcolor: 'surfaceContainer.main',
          backgroundColor: '#1f1e2a',
          borderRadius: 2,
          p: 0.5,
          boxShadow: 1,
          zIndex: 30,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChange}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab
            label="Posts"
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              fontWeight: 500,
              minHeight: 48,
              mx: '2px',
              color: '#ccc3d4',
              '&.Mui-selected': {
                color: '#d4bbff',
                backgroundColor: '#343440',
                boxShadow: 1,
              },
              '&:hover:not(.Mui-selected)': {
                backgroundColor: '#343440',
                color: '#e3e0f1',
              },
            }}
          />

          <Tab
            label="Comments"
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              fontWeight: 500,
              minHeight: 48,
              mx: '2px',
              color: '#ccc3d4',
              '&.Mui-selected': {
                color: '#d4bbff',
                backgroundColor: '#343440',
                boxShadow: 1,
              },
              '&:hover:not(.Mui-selected)': {
                backgroundColor: '#343440',
                color: '#e3e0f1',
              },
            }}
          />
          {canViewPrivateTabs && (
            <Tab
              label="Saved"
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 500,
                minHeight: 48,
                mx: '2px',
                color: '#ccc3d4',
                '&.Mui-selected': {
                  color: '#d4bbff',
                  backgroundColor: '#343440',
                  boxShadow: 1,
                },
                '&:hover:not(.Mui-selected)': {
                  backgroundColor: '#343440',
                  color: '#e3e0f1',
                },
              }}
            />
          )}
        </Tabs>
      </Box>

      {/* Feed Content */}
      <Fade in timeout={250} key={currentTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentTab === 2 ? (
            /* Saved Tab */
            savedState.loading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#d4bbff' }} />
              </Box>
            ) : savedState.error ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'error.light', textAlign: 'center' }}>{savedState.error}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void loadSavedPosts()}
                  sx={{ textTransform: 'none', borderRadius: 2, color: '#d4bbff', borderColor: 'rgba(179,136,255,0.3)' }}
                >
                  Retry
                </Button>
              </Box>
            ) : savedState.items.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                You have no saved posts
              </Typography>
            ) : (
              <>
                {savedState.items.map((post) => (
                  <PostCard key={post.id} post={post} initialLiked={postLikeStatuses[post.id]} canEdit={isOwner} />
                ))}
                {savedState.cursor && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => void loadSavedPosts(savedState.cursor)}
                      disabled={savedState.loadingMore}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 4,
                        py: 0.75,
                        color: '#d4bbff',
                        borderColor: 'rgba(179,136,255,0.3)',
                        '&:hover': { borderColor: '#d4bbff', backgroundColor: 'rgba(179,136,255,0.08)' },
                      }}
                    >
                      {savedState.loadingMore ? (
                        <CircularProgress size={18} sx={{ color: '#d4bbff' }} />
                      ) : (
                        'Load more saved posts'
                      )}
                    </Button>
                  </Box>
                )}
              </>
            )
          ) : currentTab === 1 ? (
            /* Comments Tab */
            commentsState.loading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#d4bbff' }} />
              </Box>
            ) : commentsState.error ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'error.light', textAlign: 'center' }}>{commentsState.error}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void loadComments()}
                  sx={{ textTransform: 'none', borderRadius: 2, color: '#d4bbff', borderColor: 'rgba(179,136,255,0.3)' }}
                >
                  Retry
                </Button>
              </Box>
            ) : commentsState.items.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any comments' : 'User has not made any comments'}
              </Typography>
            ) : (
              <>
                {commentsState.items.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    initialLiked={commentLikeStatuses[comment.id]}
                    canEdit={isOwner}
                    inPost={false}
                  />
                ))}
                {commentsState.cursor && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => void loadComments(commentsState.cursor)}
                      disabled={commentsState.loadingMore}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 4,
                        py: 0.75,
                        color: '#d4bbff',
                        borderColor: 'rgba(179,136,255,0.3)',
                        '&:hover': { borderColor: '#d4bbff', backgroundColor: 'rgba(179,136,255,0.08)' },
                      }}
                    >
                      {commentsState.loadingMore ? (
                        <CircularProgress size={18} sx={{ color: '#d4bbff' }} />
                      ) : (
                        'Load more comments'
                      )}
                    </Button>
                  </Box>
                )}
              </>
            )
          ) : (
            /* Posts Tab (currentTab === 0) */
            postsState.loading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#d4bbff' }} />
              </Box>
            ) : postsState.error ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'error.light', textAlign: 'center' }}>{postsState.error}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void loadPosts()}
                  sx={{ textTransform: 'none', borderRadius: 2, color: '#d4bbff', borderColor: 'rgba(179,136,255,0.3)' }}
                >
                  Retry
                </Button>
              </Box>
            ) : postsState.items.length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any posts' : 'User has not made any posts'}
              </Typography>
            ) : (
              <>
                {postsState.items.map((post) => (
                  <PostCard key={post.id} post={post} initialLiked={postLikeStatuses[post.id]} canEdit={isOwner} />
                ))}
                {postsState.cursor && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => void loadPosts(postsState.cursor)}
                      disabled={postsState.loadingMore}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 4,
                        py: 0.75,
                        color: '#d4bbff',
                        borderColor: 'rgba(179,136,255,0.3)',
                        '&:hover': { borderColor: '#d4bbff', backgroundColor: 'rgba(179,136,255,0.08)' },
                      }}
                    >
                      {postsState.loadingMore ? (
                        <CircularProgress size={18} sx={{ color: '#d4bbff' }} />
                      ) : (
                        'Load more posts'
                      )}
                    </Button>
                  </Box>
                )}
              </>
            )
          )}
        </Box>
      </Fade>
    </Box>
  );
}
