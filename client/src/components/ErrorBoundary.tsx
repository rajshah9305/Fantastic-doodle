import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-black">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 bg-zinc-950 border border-orange-900/30 rounded-lg">
            <div className="w-16 h-16 bg-red-900/30 border border-red-900/50 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle
                size={32}
                className="text-red-500 flex-shrink-0"
              />
            </div>

            <h2 className="text-xl font-bold text-white mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-zinc-900 border border-orange-900/30 overflow-auto mb-6">
              <pre className="text-sm text-slate-400 whitespace-break-spaces font-mono">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-mono text-sm font-bold uppercase",
                "bg-orange-600 text-white",
                "hover:bg-orange-700 cursor-pointer",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                "transition-all"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
