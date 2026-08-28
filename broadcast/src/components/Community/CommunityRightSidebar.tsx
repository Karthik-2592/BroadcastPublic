import Box from '@mui/material/Box';
import CommunityStatsWidget from './CommunityStatsWidget';
import RelatedCommunitiesWidget from './RelatedCommunitiesWidget';
import CommunityGuidelinesWidget from './CommunityGuidelinesWidget';

export default function CommunityRightSidebar() {
  return (
    <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CommunityStatsWidget />
      <RelatedCommunitiesWidget />
      <CommunityGuidelinesWidget />
    </Box>
  );
}

