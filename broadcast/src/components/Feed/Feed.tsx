// Feed — Scrollable container that renders a list of PostCard components.
// Retrieves posts from the feed endpoint and maps each entry to a PostCard.

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useCallback, useEffect, useState } from 'react';
import PostCard from '../PostCard/PostCard';
import type { Post, RelationStatusMap } from '../../types/api';
import UserRecommendations from './UserRecommendations';
import { BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function Feed({ endpoint = '/feed' }: { endpoint?: string }) {
  const { isAuthenticated } = useAuth();
  const [showRecommendations] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [likeStatuses, setLikeStatuses] = useState<RelationStatusMap>({});

  const fetchLikeStatuses = useCallback(async (ids: string[]) => {
    if (!isAuthenticated || !ids.length) return;
    try {
      const response = await fetch(`${BASE_URL}/posts/likes/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
        credentials: 'include',
      });
      if (response.ok) {
        const body = await response.json() as { data?: RelationStatusMap };
        if (body.data) setLikeStatuses((current) => ({ ...current, ...body.data }));
      }
    } catch { /* non-critical, falls back to false */ }
  }, [isAuthenticated]);

  const loadPosts = useCallback(async (nextCursor?: string | null) => {
    setLoading(true);
    try {
      const query = nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : '';
      const response = await fetch(`${BASE_URL}${endpoint}${query}`, { credentials: 'include' });
      if (response.ok) {
        const body = await response.json() as { data?: Post[]; cursor?: string };
        const page = Array.isArray(body.data) ? body.data : [];
        setPosts((current) => nextCursor ? [...current, ...page] : page);
        setCursor(body.cursor === 'null' ? null : body.cursor ?? null);
        void fetchLikeStatuses(page.map((p) => p.id));
      } else if (!nextCursor) setPosts([]);
    } catch {
      if (!nextCursor) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchLikeStatuses]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const firstPosts = posts.slice(0, 8);
  const remainingPosts = posts.slice(8);

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
          {showRecommendations && <UserRecommendations />}
          {remainingPosts.map((post) => (
            <PostCard key={post.id} post={post} initialLiked={likeStatuses[post.id]} />
          ))}
          {cursor && <Button variant="outlined" onClick={() => void loadPosts(cursor)} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : 'Load more posts'}
          </Button>}
        </>
      )}
    </Box>
  );
}
