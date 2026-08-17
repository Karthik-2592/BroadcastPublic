export default function CommunityStatsWidget() {
  return (
    <div className="rounded-xl bg-surface-container p-6 shadow-md relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
      <h4 className="text-subtitle-1 font-subtitle-1 text-high mb-4 flex items-center gap-2 font-semibold">
        <span className="material-symbols-outlined text-primary">bar_chart</span>
        Community Stats
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col bg-surface-variant/30 p-3 rounded-lg">
          <span className="text-headline-md font-headline-md text-primary font-bold text-lg">12.4k</span>
          <span className="text-label-sm font-label-sm text-text-med text-xs">Members</span>
        </div>
        <div className="flex flex-col bg-surface-variant/30 p-3 rounded-lg">
          <span className="text-headline-md font-headline-md text-on-surface font-bold text-lg">1.2k</span>
          <span className="text-label-sm font-label-sm text-text-med text-xs">Total Community Posts</span>
        </div>
        <div className="flex flex-col bg-surface-variant/30 p-3 rounded-lg">
          <span className="text-headline-md font-headline-md text-tertiary font-bold text-lg">Top 5%</span>
          <span className="text-label-sm font-label-sm text-text-med text-xs">Rank</span>
        </div>
      </div>
    </div>
  );
}
