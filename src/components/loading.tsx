import { Spinner } from "@heroui/spinner";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Spinner />
    </div>
  );
}
