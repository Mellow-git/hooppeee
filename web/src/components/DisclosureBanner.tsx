export function DisclosureBanner({ text }: { text: string }) {
  return (
    <div
      className="sticky top-14 z-20 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-navy md:top-16"
      role="note"
    >
      {text}
    </div>
  );
}
