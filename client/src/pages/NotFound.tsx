import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 flex items-center justify-center font-sans relative">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-zinc-950 border border-orange-900/30 rounded-lg p-6 sm:p-8 text-center hover:border-orange-500/50 transition-all">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-900/30 border border-red-900/50 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white mb-2 tracking-tighter">404</h1>

          <h2 className="text-lg sm:text-xl font-bold text-orange-500 mb-4 uppercase tracking-wide">
            Page Not Found
          </h2>

          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <button
            onClick={handleGoHome}
            className="px-6 py-3 font-mono text-xs sm:text-sm font-bold uppercase bg-orange-600 text-white hover:bg-orange-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 mx-auto"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
