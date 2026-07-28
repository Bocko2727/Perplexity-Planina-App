import { useEffect } from "react";
import { X } from "lucide-react";

export function ModalShell({ title, icon: Icon, onClose, children, wide }: any) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-4 border-b border-stone-200 sticky top-0 bg-white z-10">
          {Icon && <Icon size={18} className="text-emerald-600" />}
          <h2 className="font-bold text-stone-800 flex-1">{title}</h2>
          <button onClick={onClose} aria-label="Затвори" className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
