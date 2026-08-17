import { useState } from 'react';
import Box from '@mui/material/Box';
import CommunityHero from '../components/Community/CommunityHero';
import CommunitySortTabs from '../components/Community/CommunitySortTabs';
import CommunityRightSidebar from '../components/Community/CommunityRightSidebar';
import PostCard from '../components/PostCard/PostCard';
import { mockPosts, type MockPost } from '../data/mockData';

export default function CommunitiesPage() {
  const [sortTab, setSortTab] = useState<'new' | 'top'>('new');

  const displayedPosts: MockPost[] = sortTab === 'top'
    ? [...mockPosts].sort((a, b) => b.likes - a.likes)
    : mockPosts;

  return (
    <>
      <div className="flex flex-col relative py-6 w-[65%] mx-auto pl-8">
        {/* Community Banner Hero */}
        <CommunityHero />
      </div>

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
        <Box sx={{ justifySelf: 'end', width: '100%', maxWidth: 720 }}>
          <CommunitySortTabs activeTab={sortTab} onTabChange={setSortTab} />

          {/* Reused Post Cards */}
          <div className="flex flex-col gap-4 mt-6">
            {displayedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </Box>

        <Box sx={{ maxHeight: '100%' }}>
          <CommunityRightSidebar />
        </Box>
      </Box>
    </>
  );
}

