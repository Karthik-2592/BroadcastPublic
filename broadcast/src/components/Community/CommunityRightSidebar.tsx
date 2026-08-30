import Box from '@mui/material/Box';
import CommunityStatsWidget from './CommunityStatsWidget';
import RelatedCommunitiesWidget from './RelatedCommunitiesWidget';
import CommunityGuidelinesWidget from './CommunityGuidelinesWidget';
import type { Community } from '../../types/api';
import { communityGuidelines } from '../../data/mockData';

export default function CommunityRightSidebar({ community }: { community: Community }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CommunityStatsWidget community={community} />
      <RelatedCommunitiesWidget />
      <CommunityGuidelinesWidget guidelines={communityGuidelines[community.id] ?? communityGuidelines.default} />
    </Box>
  );
}
