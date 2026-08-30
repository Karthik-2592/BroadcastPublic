// Feed — Scrollable container that renders a list of PostCard components.
// Receives mock post data and maps each entry to a PostCard.

import Box from '@mui/material/Box';
import { useState } from 'react';
import PostCard from '../PostCard/PostCard';
import { mockPosts } from '../../data/mockData';
import UserRecommendations from './UserRecommendations';

export default function Feed() {
  const [showRecommendations] = useState(true);
  const firstPosts = mockPosts.slice(0, 8);
  const remainingPosts = mockPosts.slice(8);

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
      {firstPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {showRecommendations && <UserRecommendations />}
      {remainingPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Box>
  );
}
