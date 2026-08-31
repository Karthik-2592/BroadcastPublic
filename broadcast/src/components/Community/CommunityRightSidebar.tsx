import Box from '@mui/material/Box';
import CommunityStatsWidget from './CommunityStatsWidget';
import RelatedCommunitiesWidget from './RelatedCommunitiesWidget';
import CommunityGuidelinesWidget from './CommunityGuidelinesWidget';
import type { Community } from '../../types/api';

export default function CommunityRightSidebar({ community }: { community: Community }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CommunityStatsWidget community={community} />
      <RelatedCommunitiesWidget />
      <CommunityGuidelinesWidget guidelines={(community.community_guidelines ?? '').split('\n').filter(Boolean)} />
    </Box>
  );
}
