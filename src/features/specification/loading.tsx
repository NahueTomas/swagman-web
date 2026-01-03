import { cn } from "@/shared/utils/cn";

export function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-[280px] flex flex-col gap-4">
        {/* Technical Label */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xxs font-black uppercase tracking-[0.3em] text-foreground-100">
            Building UI
          </h2>
          <span className="text-xxs font-mono text-primary-500 animate-pulse">
            IDLE_READY
          </span>
        </div>

        {/* Custom Technical Progress Bar */}
        <div className="relative h-0.5 w-full bg-divider/30 overflow-hidden rounded-full">
          <div
            className={cn(
              "absolute h-full bg-primary-500 shadow-[0_0_15px_rgba(190,151,110,0.5)]",
              "animate-loading-bar w-1/3"
            )}
          />
        </div>

        {/* Metadata / Subtext */}
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-mono text-foreground-500 uppercase tracking-widest">
            Fetching OpenApi Definition...
          </p>
          <div className="flex gap-1">
            <div className="size-1 rounded-full bg-primary-500/40 animate-bounce [animation-delay:-0.3s]" />
            <div className="size-1 rounded-full bg-primary-500/40 animate-bounce [animation-delay:-0.15s]" />
            <div className="size-1 rounded-full bg-primary-500/40 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Subtle Background Branding */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-20">
        <span className="text-xxs font-black tracking-[0.5em] uppercase text-foreground-800">
          Swagman
        </span>
      </div>
    </div>
  );
}
