import { useEffect, useState, useCallback,  type SyntheticEvent } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { seedPostLikeStatuses, seedCommentLikeStatuses } from '../../queries/likes';
import { useUserPosts, useUserComments, useUserSavedPosts } from '../../queries/users';
import { BASE_URL } from '../../config';

interface ProfileTabsProps {
  userId?: string;
  sessionUserId?: string;
}

export default function ProfileTabs({ userId = 'user_1', sessionUserId = 'user_1' }: ProfileTabsProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = Boolean(isAuthenticated && userId && sessionUserId && userId === sessionUserId);
  const canViewPrivateTabs = isAuthenticated && isOwner;

  const [activeTab, setActiveTab] = useState(0);

  // TanStack Query hooks for user content
  const postsQuery = useUserPosts(userId);
  const commentsQuery = useUserComments(userId);
  const savedPostsQuery = useUserSavedPosts(canViewPrivateTabs ? sessionUserId : null);

  const [postLikeStatuses, setPostLikeStatuses] = useState<RelationStatusMap>({});
  const [commentLikeStatuses, setCommentLikeStatuses] = useState<RelationStatusMap>({});

  // Reset tab when identity (userId or ownership) changes
  const identityKey = `${userId}:${sessionUserId}:${canViewPrivateTabs}`;
  const [lastIdentity, setLastIdentity] = useState(identityKey);

  if (lastIdentity !== identityKey) {
    setLastIdentity(identityKey);
    setPostLikeStatuses({});
    setCommentLikeStatuses({});
    if (!canViewPrivateTabs && activeTab === 2) {
      setActiveTab(0);
    }
  }

  const currentTab = activeTab === 2 && !canViewPrivateTabs ? 0 : activeTab;

  // Helper functions to fetch like statuses for paginated data
  const fetchPostLikeStatuses = useCallback(async (posts: ApiPost[]) => {
    if (!isAuthenticated || posts.length === 0) return;
    try {
      const response = await fetch(`${BASE_URL}/posts/likes/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: posts.map((p) => p.id) }),
        credentials: 'include',
      });
      if (response.ok) {
        const body = await response.json() as { data?: RelationStatusMap };
        if (body.data) {
          setPostLikeStatuses((prev) => ({ ...prev, ...body.data }));
          seedPostLikeStatuses(queryClient, body.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch post like statuses:', error);
    }
  }, [isAuthenticated, queryClient]);

  const fetchCommentLikeStatuses = useCallback(async (comments: ApiComment[]) => {
    if (!isAuthenticated || comments.length === 0) return;
    try {
      const response = await fetch(`${BASE_URL}/comments/likes/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: comments.map((c) => c.id) }),
        credentials: 'include',
      });
      if (response.ok) {
        const body = await response.json() as { data?: RelationStatusMap };
        if (body.data) {
          setCommentLikeStatuses((prev) => ({ ...prev, ...body.data }));
          seedCommentLikeStatuses(queryClient, body.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch comment like statuses:', error);
    }
  }, [isAuthenticated, queryClient]);

  // Track which items we've already fetched like statuses for
  const [fetchedPostIds, setFetchedPostIds] = useState<Set<string>>(new Set());
  const [fetchedCommentIds, setFetchedCommentIds] = useState<Set<string>>(new Set());

  // Fetch like statuses when new data is loaded
  useEffect(() => {
    const posts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? [];
    const newPosts = posts.filter((post) => !fetchedPostIds.has(post.id));
    if (newPosts.length > 0 && !postsQuery.isFetching) {
      void fetchPostLikeStatuses(newPosts);
      setFetchedPostIds((prev) => new Set([...prev, ...newPosts.map((p) => p.id)]));
    }
  }, [postsQuery.data, postsQuery.isFetching, fetchPostLikeStatuses, fetchedPostIds]);

  useEffect(() => {
    const comments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];
    const newComments = comments.filter((comment) => !fetchedCommentIds.has(comment.id));
    if (newComments.length > 0 && !commentsQuery.isFetching) {
      void fetchCommentLikeStatuses(newComments);
      setFetchedCommentIds((prev) => new Set([...prev, ...newComments.map((c) => c.id)]));
    }
  }, [commentsQuery.data, commentsQuery.isFetching, fetchCommentLikeStatuses, fetchedCommentIds]);

  useEffect(() => {
    const savedPosts = savedPostsQuery.data?.pages.flatMap((page) => page.posts) ?? [];
    const newSavedPosts = savedPosts.filter((post) => !fetchedPostIds.has(post.id));
    if (newSavedPosts.length > 0 && !savedPostsQuery.isFetching) {
      void fetchPostLikeStatuses(newSavedPosts);
      setFetchedPostIds((prev) => new Set([...prev, ...newSavedPosts.map((p) => p.id)]));
    }
  }, [savedPostsQuery.data, savedPostsQuery.isFetching, fetchPostLikeStatuses, fetchedPostIds]);

  // Reset fetched IDs when user changes
  useEffect(() => {
    setFetchedPostIds(new Set());
    setFetchedCommentIds(new Set());
  }, [userId, sessionUserId]);

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
            savedPostsQuery.isLoading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#d4bbff' }} />
              </Box>
            ) : savedPostsQuery.isError ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'error.light', textAlign: 'center' }}>Unable to load saved posts</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void savedPostsQuery.refetch()}
                  sx={{ textTransform: 'none', borderRadius: 2, color: '#d4bbff', borderColor: 'rgba(179,136,255,0.3)' }}
                >
                  Retry
                </Button>
              </Box>
            ) : !savedPostsQuery.data || savedPostsQuery.data.pages.flatMap((page) => page.posts).length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                You have no saved posts
              </Typography>
            ) : (
              <>
                {savedPostsQuery.data.pages.flatMap((page) => page.posts).map((post) => (
                  <PostCard key={post.id} post={post} initialLiked={postLikeStatuses[post.id]} canEdit={isOwner} />
                ))}
                {savedPostsQuery.hasNextPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => void savedPostsQuery.fetchNextPage()}
                      disabled={savedPostsQuery.isFetchingNextPage}
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
                      {savedPostsQuery.isFetchingNextPage ? (
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
            commentsQuery.isLoading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#d4bbff' }} />
              </Box>
            ) : commentsQuery.isError ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'error.light', textAlign: 'center' }}>Unable to load comments</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void commentsQuery.refetch()}
                  sx={{ textTransform: 'none', borderRadius: 2, color: '#d4bbff', borderColor: 'rgba(179,136,255,0.3)' }}
                >
                  Retry
                </Button>
              </Box>
            ) : !commentsQuery.data || commentsQuery.data.pages.flatMap((page) => page.comments).length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any comments' : 'User has not made any comments'}
              </Typography>
            ) : (
              <>
                {commentsQuery.data.pages.flatMap((page) => page.comments).map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    initialLiked={commentLikeStatuses[comment.id]}
                    canEdit={isOwner}
                    inPost={false}
                  />
                ))}
                {commentsQuery.hasNextPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => void commentsQuery.fetchNextPage()}
                      disabled={commentsQuery.isFetchingNextPage}
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
                      {commentsQuery.isFetchingNextPage ? (
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
            postsQuery.isLoading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#d4bbff' }} />
              </Box>
            ) : postsQuery.isError ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'error.light', textAlign: 'center' }}>Unable to load posts</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => void postsQuery.refetch()}
                  sx={{ textTransform: 'none', borderRadius: 2, color: '#d4bbff', borderColor: 'rgba(179,136,255,0.3)' }}
                >
                  Retry
                </Button>
              </Box>
            ) : !postsQuery.data || postsQuery.data.pages.flatMap((page) => page.posts).length === 0 ? (
              <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                {isOwner ? 'You have not made any posts' : 'User has not made any posts'}
              </Typography>
            ) : (
              <>
                {postsQuery.data.pages.flatMap((page) => page.posts).map((post) => (
                  <PostCard key={post.id} post={post} initialLiked={postLikeStatuses[post.id]} canEdit={isOwner} />
                ))}
                {postsQuery.hasNextPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => void postsQuery.fetchNextPage()}
                      disabled={postsQuery.isFetchingNextPage}
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
                      {postsQuery.isFetchingNextPage ? (
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
