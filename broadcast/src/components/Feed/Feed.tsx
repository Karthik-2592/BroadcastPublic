// Feed — Scrollable container that renders a list of PostCard components.
// Retrieves posts from the feed endpoint and maps each entry to a PostCard.

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useMemo, useRef } from 'react';
import PostCard from '../PostCard/PostCard';
import type { RelationStatusMap } from '../../types/api';
import UserRecommendations from './UserRecommendations';
import { BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useInfiniteFeed } from '../../queries/posts';
import { useUserRecommendations } from '../../queries/users';
import { useQueryClient } from '@tanstack/react-query';
import { seedPostLikeStatuses } from '../../queries/likes';
import { useState } from 'react';

export default function Feed({ endpoint = '/feed' }: { endpoint?: string }) {
  const { isAuthenticated, currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [likeStatuses, setLikeStatuses] = useState<RelationStatusMap>({});
  const recommendations = useUserRecommendations(
    isAuthenticated ? currentUser?.id : undefined,
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteFeed(endpoint);

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  const fetchedLikeIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !posts.length) return;
    const newIds = posts.map((p) => p.id).filter((id) => !fetchedLikeIds.current.has(id));
    if (!newIds.length) return;
    newIds.forEach((id) => fetchedLikeIds.current.add(id));

    void fetch(`${BASE_URL}/posts/likes/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newIds }),
      credentials: 'include',
    })
      .then(async (response) => {
        if (response.ok) {
          const body = (await response.json()) as { data?: RelationStatusMap };
          if (body.data) {
            setLikeStatuses((current) => ({ ...current, ...body.data }));
            // Seed per-post cache entries so PostViewPage gets instant hits
            seedPostLikeStatuses(queryClient, body.data);
          }
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated, posts, queryClient]);

  const firstPosts = posts.slice(0, 8);
  const remainingPosts = posts.slice(8);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 720, py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 720,
        py: 2,
        justifySelf: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {posts.length === 0 ? (
        <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
          Nothing to see here
        </Typography>
      ) : (
        <>
          {firstPosts.map((post) => (
            <PostCard key={post.id} post={post} initialLiked={likeStatuses[post.id]} />
          ))}
          {isAuthenticated && !recommendations.isLoading && recommendations.data && (
            <UserRecommendations users={recommendations.data} />
          )}
          {remainingPosts.map((post) => (
            <PostCard key={post.id} post={post} initialLiked={likeStatuses[post.id]} />
          ))}
          {hasNextPage ? (
            <Button
              variant="outlined"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? <CircularProgress size={18} /> : 'Load more posts'}
            </Button>
          ) :<Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
              You have reached the end
            </Box>}
        </>
      )}
    </Box>
  );
}
