import { Spinner } from "@heroui/spinner";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-col items-center justify-center gap-8">
        <h2 className="text-2xl font-bold">Loading specification...</h2>
        <Spinner />
      </div>
    </div>
  );
}
