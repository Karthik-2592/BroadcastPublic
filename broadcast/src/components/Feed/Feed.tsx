// Feed — Scrollable container that renders a list of PostCard components.
// Receives mock post data and maps each entry to a PostCard.

import Box from '@mui/material/Box';
import PostCard from '../PostCard/PostCard';
import { mockPosts } from '../../data/mockData';

export default function Feed() {
  return (
    <Box
      sx={{
        maxWidth: 840,
        mx: 'auto',
        py: 2,
        px: 1,

      }}
    >
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  );
}
