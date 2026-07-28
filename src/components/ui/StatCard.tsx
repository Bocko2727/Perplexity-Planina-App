export function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent || "bg-emerald-50 text-emerald-700"}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-stone-400 font-bold">{label}</div>
        <div className="text-lg font-bold text-stone-800 truncate">{value}</div>
      </div>
    </div>
  );
}
