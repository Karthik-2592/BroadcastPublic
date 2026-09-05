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
import { useAuth } from '../context/AuthContext';

export default function PostViewPage() {
  const { postId } = useParams<{ postId: string }>();
  const { currentUser, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [communityAdminId, setCommunityAdminId] = useState<string | null>(null);
  useEffect(() => { if (postId) void fetch(`${BASE_URL}/posts/${postId}`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((body: { data?: Post } | null) => setPost(body?.data ?? null)); }, [postId]);

  useEffect(() => {
    if (!post?.community_id) {
      setCommunityAdminId(null);
      return;
    }

    void fetch(`${BASE_URL}/communities/${post.community_id}`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { data?: { admin_id?: string | null } } | null) => setCommunityAdminId(body?.data?.admin_id ?? null))
      .catch(() => setCommunityAdminId(null));
  }, [post?.community_id]);

  const canManagePost = Boolean(post && isAuthenticated && (post.user_id === currentUser?.id || communityAdminId === currentUser?.id));

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
        {post && <PostCard post={post} variant="expanded" canEdit={canManagePost} communityAdminId={communityAdminId} />}

        {/* ── Comments Section ── */}
        <CommentsSection postId={postId} commentCount={post?.comment_count ?? 0} communityAdminId={communityAdminId} />
      </Box>
      <Box sx={{ width: '100%' }} />
    </Box>
  );
}
