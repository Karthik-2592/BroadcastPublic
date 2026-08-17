export default function CommunityHero() {
  return (
    <div
      className="relative w-full h-[320px] rounded-xl overflow-hidden shadow-xl mb-6"
      style={{
        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC_hMgUDtQc33ZyA_b-HI2lBkUw-QvBohNMCh3Wueks2Bdj2NEVk1oKEd9sg4OxFSveTjlu2X0dEpVHkbeBjgj9NY0GccQqXBGaRM3ifFyf6ljxNT3F1PibmtZZyxQWr2uisrAeZdVLR9OlSX7RhfEBZ5xYRpfHQefM4d2UUYrYx2iJK-phDSFAS5GJzgxp5ElH4JXry2T7go9nbURq8uZG9eBfseZOCrvYlc8tQKMCZGj_3oFrtgIpIEAmv4olJEZK3w')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/90 via-surface/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2 z-10">
        <div className="flex items-end justify-between w-full max-w-container-max mx-auto px-margin-desktop">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_12px_rgba(85,222,158,0.6)]"></span>
              <span className="text-label-sm font-label-sm text-secondary tracking-widest uppercase">Community</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg text-high font-bold text-2xl text-white">Web Developers</h1>
            <p className="text-body-md font-body-md text-text-med mt-2 max-w-xl text-gray-300">
              A space for full-stack developers to share projects, ask questions, and discuss the latest in React, Node.js, and modern web architecture.
            </p>
            <div className="flex items-center gap-4 mt-4 text-subtitle-2 font-subtitle-2 text-on-surface-variant text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">group</span> 12,400 Members
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-primary font-label-lg transition-all shadow-md hover:shadow-lg cursor-pointer">
              Create Post
            </button>
            <button className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-lg transition-all shadow-[0_4px_14px_rgba(212,187,255,0.3)] hover:shadow-[0_6px_20px_rgba(212,187,255,0.5)] cursor-pointer">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
