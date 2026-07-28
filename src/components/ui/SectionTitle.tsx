export function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-stone-700 uppercase tracking-wide mb-3">
      {Icon && <Icon size={16} className="text-emerald-600" />}
      {children}
    </h3>
  );
}
