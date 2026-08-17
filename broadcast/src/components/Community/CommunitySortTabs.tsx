import { useState } from 'react';

interface CommunitySortTabsProps {
  activeTab?: 'new' | 'top';
  onTabChange?: (tab: 'new' | 'top') => void;
}

export default function CommunitySortTabs({
  activeTab = 'new',
  onTabChange,
}: CommunitySortTabsProps) {
  const [selected, setSelected] = useState<'new' | 'top'>(activeTab);

  const handleSelect = (tab: 'new' | 'top') => {
    setSelected(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container shadow-md">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSelect('new')}
          className={`px-4 py-2 rounded-full font-label-sm transition-all cursor-pointer ${
            selected === 'new'
              ? 'bg-primary-container/20 text-primary font-bold shadow-[0_4px_20px_rgba(179,136,255,0.08)]'
              : 'text-text-med hover:text-on-surface hover:bg-surface-variant/50'
          }`}
        >
          New
        </button>
        <button
          onClick={() => handleSelect('top')}
          className={`px-4 py-2 rounded-full font-label-sm transition-all cursor-pointer ${
            selected === 'top'
              ? 'bg-primary-container/20 text-primary font-bold shadow-[0_4px_20px_rgba(179,136,255,0.08)]'
              : 'text-text-med hover:text-on-surface hover:bg-surface-variant/50'
          }`}
        >
          Top
        </button>
      </div>
      <button className="p-2 rounded-full text-text-med hover:text-on-surface transition-all cursor-pointer">
        <span className="material-symbols-outlined">filter_list</span>
      </button>
    </div>
  );
}
