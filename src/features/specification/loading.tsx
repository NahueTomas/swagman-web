import { Subtitle } from "@/shared/components/subtitle";

export function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-950 p-4 overflow-hidden">
      {/* Center content */}
      <div className="relative flex flex-col items-center gap-6 animate-fade-in">
        {/* Brand */}
        <Subtitle as="h1" className="text-foreground-300">
          SWAGMAN
        </Subtitle>

        {/* Progress bar */}
        <div className="flex flex-col items-center gap-4 w-48">
          <div className="relative h-px w-full bg-white/[0.06] overflow-hidden rounded-full">
            <div className="absolute h-full w-1/3 bg-primary-500/80 rounded-full animate-loading-wave" />
          </div>

          <Subtitle
            as="p"
            className="text-foreground-700 animate-fade-in [animation-delay:0.3s] opacity-0"
            size="micro"
          >
            Loading specification
          </Subtitle>
        </div>
      </div>
    </div>
  );
}
