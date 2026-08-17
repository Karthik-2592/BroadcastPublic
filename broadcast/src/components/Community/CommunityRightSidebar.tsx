import CommunityStatsWidget from './CommunityStatsWidget';
import RelatedCommunitiesWidget from './RelatedCommunitiesWidget';
import CommunityGuidelinesWidget from './CommunityGuidelinesWidget';

export default function CommunityRightSidebar() {
  return (
    <div className="w-[280px] shrink-0 flex flex-col gap-6">
      <CommunityStatsWidget />
      <RelatedCommunitiesWidget />
      <CommunityGuidelinesWidget />
    </div>
  );
}
