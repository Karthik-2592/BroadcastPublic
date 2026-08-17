export default function CommunityGuidelinesWidget() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-surface-container to-surface-variant p-6 shadow-md border-t border-primary/20">
      <h4 className="text-subtitle-1 font-subtitle-1 text-high mb-2 font-semibold text-white">
        Community Guidelines
      </h4>
      <ul className="text-body-md font-body-md text-on-surface-variant space-y-2 text-sm text-gray-300 list-disc list-inside">
        <li>Be respectful and inclusive to all community members.</li>
        <li>Keep discussions relevant to web development and engineering.</li>
        <li>Format code snippets clearly and provide context for technical questions.</li>
        <li>No self-promotion, spam, or off-topic advertising.</li>
      </ul>
    </div>
  );
}
