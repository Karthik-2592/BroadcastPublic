export default function RelatedCommunitiesWidget() {
  const related = [
    { id: '1', name: 'ReactDevs', members: '89k members', icon: 'code', colorClass: 'text-primary group-hover:bg-primary group-hover:text-on-primary' },
    { id: '2', name: 'Backend Architecture', members: '112k members', icon: 'dns', colorClass: 'text-secondary group-hover:bg-secondary group-hover:text-on-secondary' },
    { id: '3', name: 'CSS Wizards', members: '45k members', icon: 'brush', colorClass: 'text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary' },
  ];

  return (
    <div className="rounded-xl bg-surface-container p-6 shadow-md">
      <h4 className="text-subtitle-1 font-subtitle-1 text-high mb-4 uppercase tracking-wider text-label-sm text-xs font-semibold text-gray-400">
        Related Communities
      </h4>
      <div className="flex flex-col gap-4">
        {related.map((item) => (
          <a key={item.id} className="flex items-center justify-between group cursor-pointer" href="#">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center transition-colors ${item.colorClass}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-body-md font-body-md text-on-surface group-hover:text-primary transition-colors text-sm font-medium">
                  {item.name}
                </span>
                <span className="text-label-sm font-label-sm text-text-med text-xs text-gray-400">
                  {item.members}
                </span>
              </div>
            </div>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </a>
        ))}
      </div>
    </div>
  );
}
