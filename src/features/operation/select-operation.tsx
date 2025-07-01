import { Chip } from "@heroui/chip";

import { ThunderIcon } from "@/shared/components/ui/icons";

export const SelectOperation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="flex flex-col items-center gap-4 max-w-md">
        <h2 className="text-xl font-semibold">Select an Operation</h2>
        <p className="text-default-500 text-sm">
          Choose an API operation from the sidebar to view its details and test
          it out.
        </p>
        <Chip color="primary" variant="flat">
          <ThunderIcon className="size-12" />
        </Chip>
      </div>
    </div>
  );
};
