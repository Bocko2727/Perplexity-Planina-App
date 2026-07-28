import { Download } from "lucide-react";

import type { DetailedRoute } from "../../types/route";
import { buildGpxFromRoute } from "../../lib/gpx/builder";
import { downloadFile, toFileSlug } from "../../lib/gpx/utils";

interface GpxExportButtonProps {
  route: DetailedRoute;
  className?: string;
}

export function GpxExportButton({ route, className }: GpxExportButtonProps) {
  const handleExport = () => {
    downloadFile(`${toFileSlug(route.name)}.gpx`, buildGpxFromRoute(route), "application/gpx+xml");
  };

  return (
    <button
      onClick={handleExport}
      title="Изтегли маршрута като GPX"
      className={className || "text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"}
    >
      <Download size={13} /> GPX
    </button>
  );
}
