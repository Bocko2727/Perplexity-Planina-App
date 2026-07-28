import { diffStyle } from "../../data/constants";

export function DifficultyBadge({ difficulty }) {
  const s = diffStyle(difficulty);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {difficulty}
    </span>
  );
}
