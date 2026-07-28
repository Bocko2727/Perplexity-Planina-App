import { Component, type ReactNode } from "react";

/* =========================================================================
   Error Boundary — prevents full app crash on render errors
   ========================================================================= */

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("PlananaApp error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-4xl mb-4">🏔️</div>
            <h1 className="text-xl font-bold text-stone-800 mb-2">Нещо се обърка</h1>
            <p className="text-sm text-stone-500 mb-4">{this.state.error?.message || "Възникна неочаквана грешка."}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-500"
            >
              Презареди приложението
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
