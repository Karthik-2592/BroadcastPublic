// PostViewPage — Full expanded view of a single post, with inline CommentsSection below.
// Route: /post/:postId  (nested inside MainLayout — sidebar + topbar remain visible)
// Uses existing MockPost data; comment data comes from CommentsSection defaults.

import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import PostCard from '../components/PostCard/PostCard';
import CommentsSection from '../components/CommentsSection/CommentsSection';
import { mockPosts } from '../data/mockData';

export default function PostViewPage() {
  const { postId } = useParams<{ postId: string }>();
  const post = mockPosts.find((p) => p.id === postId) ?? mockPosts[0];

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
        <PostCard post={post} variant="expanded" />

        {/* ── Comments Section ── */}
        <CommentsSection postId={postId} />
      </Box>
      <Box sx={{ width: '100%' }} />
    </Box>
  );
}
