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
import { useCommunity } from '../queries/communities';
import { usePostLikeStatus, usePostSaveStatus } from '../queries/likes';

export default function PostViewPage() {
  const { postId } = useParams<{ postId: string }>();
  const { currentUser, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const { data: community } = useCommunity(post?.community_id);
  const communityAdminId = community?.admin_id ?? null;

  // Like + save status — served from cache when coming from a feed list; fetches on cold load.
  const { data: initialLiked } = usePostLikeStatus(postId, isAuthenticated);
  const { data: initialSaved } = usePostSaveStatus(postId, isAuthenticated);

  useEffect(() => {
    if (!postId) return;
    void fetch(`${BASE_URL}/posts/${postId}`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { data?: Post } | null) => {
        setPost(body?.data ?? null);
      });
  }, [postId]);

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
        {post && <PostCard post={post} variant="expanded" canEdit={canManagePost} communityAdminId={communityAdminId} initialLiked={initialLiked} initialSaved={initialSaved} />}

        {/* ── Comments Section ── */}
        <CommentsSection postId={postId} commentCount={post?.comment_count ?? 0} communityAdminId={communityAdminId} />
      </Box>
      <Box sx={{ width: '100%' }} />
    </Box>
  );
}
