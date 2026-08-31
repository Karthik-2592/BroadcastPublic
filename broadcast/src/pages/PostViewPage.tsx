// PostViewPage — Full expanded view of a single post, with inline CommentsSection below.
// Route: /post/:postId  (nested inside MainLayout — sidebar + topbar remain visible)
// Loads the post from the backend; comments are loaded by CommentsSection.

import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import PostCard from '../components/PostCard/PostCard';
import CommentsSection from '../components/CommentsSection/CommentsSection';
import { useEffect, useState } from 'react';
import type { Post } from '../types/api';
import { BASE_URL } from '../config';

export default function PostViewPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  useEffect(() => { if (postId) void fetch(`${BASE_URL}/posts/${postId}`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((body: { data?: Post } | null) => setPost(body?.data ?? null)); }, [postId]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.53fr',
        justifyContent: 'center',
        gap: 4,
        px: 4,
        py: 2,
        width: '100%',
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          justifySelf: 'end',
          gap: 4,
        }}
      >
        {/* ── Unified Post Card (Expanded View) ── */}
        {post && <PostCard post={post} variant="expanded" />}

        {/* ── Comments Section ── */}
        <CommentsSection postId={postId} />
      </Box>
      <Box sx={{ width: '100%' }} />
    </Box>
  );
}
