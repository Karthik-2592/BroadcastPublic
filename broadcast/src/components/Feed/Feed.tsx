// Feed — Scrollable container that renders a list of PostCard components.
// Receives mock post data and maps each entry to a PostCard.

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useCallback, useEffect, useState } from 'react';
import PostCard from '../PostCard/PostCard';
import { mockPosts } from '../../data/mockData';
import UserRecommendations from './UserRecommendations';

export default function Feed() {
  const [showRecommendations] = useState(true);
  const [posts, setPosts] = useState(mockPosts);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async (nextCursor?: string | null) => {
    setLoading(true);
    try {
      const query = nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : '';
      const response = await fetch(`/posts/feed${query}`);
      if (response.ok) {
        const body = await response.json() as { data?: typeof mockPosts; cursor?: string };
        const page = Array.isArray(body.data) ? body.data : [];
        setPosts((current) => nextCursor ? [...current, ...page] : page);
        setCursor(body.cursor === 'null' ? null : body.cursor ?? null);
      }
    } catch {
      // Keep mock posts available while the backend is unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

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
            <PostCard key={post.id} post={post} />
          ))}
          {showRecommendations && <UserRecommendations />}
          {remainingPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {cursor && <Button variant="outlined" onClick={() => void loadPosts(cursor)} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : 'Load more posts'}
          </Button>}
        </>
      )}
    </Box>
  );
}
