// Feed — Scrollable container that renders a list of PostCard components.
// Receives mock post data and maps each entry to a PostCard.

import Box from '@mui/material/Box';
import PostCard from '../PostCard/PostCard';
import { mockPosts } from '../../data/mockData';

export default function Feed() {
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
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  );
}
