import React, { useState, useEffect } from "react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { Star, Github, ArrowRight, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { APP_LINKS, fetchGitHubStars } from "@/constants/links";
import { tauriApi } from "@/lib/tauri";

interface OnboardingModalProps {
  isOpen: boolean;
  theme?: "dark" | "light";
  onClose?: () => void;
  onComplete: (name: string) => void;
}

export const OnboardingModal = ({ isOpen, theme = "dark", onClose, onComplete }: OnboardingModalProps) => {
  const [name, setName] = useState("");
  const [starCount, setStarCount] = useState<string>("...");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGitHubStars(APP_LINKS.GITHUB_REPO).then((stars) => {
      setStarCount(stars);
    });
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to continue");
      return;
    }
    onComplete(name.trim());
  };

  const handleOpenGithub = async () => {
    await tauriApi.openExternalUrl(APP_LINKS.GITHUB_REPO);
  };

  // Determine light vs dark animation source
  const isLight = theme === "light" || (typeof document !== "undefined" && document.documentElement.classList.contains("light"));
  const animationSrc = isLight
    ? "/animations/Hello-for-light.lottie"
    : "/animations/Hello-for-dark.lottie";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] rounded-none p-6 shadow-2xl text-[#09090B] dark:text-white overflow-hidden">
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white p-1 transition-colors rounded-none cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Lottie Animation Header */}
        <div className="flex flex-col items-center justify-center text-center pt-0">
          {/* Tight animation container with reduced top & bottom gaps */}
          <div className="h-36 w-44 flex items-center justify-center relative overflow-hidden -my-1">
            <DotLottiePlayer
              key={animationSrc}
              src={animationSrc}
              autoplay
              loop={false}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Clean Welcome Pill without emoji and compact margins */}
          <div className="inline-flex items-center px-3 py-1 bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/20 text-[#09090B] dark:text-white font-mono text-[10px] font-bold uppercase tracking-wider mt-1 mb-2 rounded-none">
            WELCOME TO PLYNK
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#09090B] dark:text-white font-sans">
            Let's get you set up
          </h2>
          <p className="text-xs text-zinc-600 dark:text-[#c4c7c8] mt-1 max-w-xs font-sans">
            Your personal, 100% offline desktop workspace.
          </p>
        </div>

        {/* User Name Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-x-1.5">
              <User className="h-3.5 w-3.5" />
              What should we call you?
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="ENTER YOUR CALLSIGN (E.G. DEXTER)..."
              className="bg-zinc-50 dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white placeholder:text-[#71717A] dark:placeholder:text-[#656467] focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0 h-11 text-xs font-mono uppercase rounded-none"
              autoFocus
            />
            {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-mono">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-mono text-xs uppercase font-bold transition-all flex items-center justify-center gap-x-2 rounded-none cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* GitHub Support Callout */}
        <div className="mt-6 pt-5 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={handleOpenGithub}
            className="flex items-center gap-x-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-[11px] cursor-pointer"
          >
            <Github className="h-3.5 w-3.5" />
            <span>Support open-source</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGithub}
            className="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-[#18181B] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#09090B] dark:text-white border border-[#E4E4E7] dark:border-[#27272A] font-semibold transition text-[11px] rounded-none cursor-pointer"
          >
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>Star</span>
            <span className="text-zinc-500 font-normal">({starCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
