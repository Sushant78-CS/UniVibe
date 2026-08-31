import { Sparkles } from "lucide-react";

const LandingLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl bg-violet-600/30 blur-xl" />

          {/* Logo container */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-xl shadow-violet-600/30">
            <Sparkles size={30} strokeWidth={2.2} className="text-white" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
          Uni<span className="text-violet-400">Vibe</span>
        </h1>

        {/* Tagline */}
        <p className="mt-1 text-xs text-slate-400">
          Your campus. Your community.
        </p>

        {/* Loading indicator */}
        <div className="mt-7 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
        </div>

        <p className="mt-3 text-[10px] font-medium tracking-wider text-slate-500">
          LOADING
        </p>
      </div>
    </div>
  );
};

export default LandingLoader;
