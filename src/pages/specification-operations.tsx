import { Chip } from "@heroui/chip";

import { useStore } from "@/hooks/use-store";
import { OperationHeader } from "@/features/operation/operation-header";
import { OperationTabs } from "@/features/operation/operation-tabs";
import { OperationBottomBar } from "@/features/operation/operation-bottom-bar";
import Info from "@/features/specification/info";
import { MESSAGES } from "@/shared/constants/mesagges";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) return <Info />;

  return (
    <section className="relative h-full flex flex-col">
      <OperationHeader />

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 lg:p-8">
          <div className="flex h-full">
            <section className="flex flex-col w-full">
              {operationFocused.summary && (
                <h2 className="text-base">{operationFocused.summary}</h2>
              )}
              {operationFocused.description && (
                <div className="text-sm font-semibold text-content4 mt-2.5 max-w-5xl">
                  {operationFocused.description}
                </div>
              )}
              {operationFocused.deprecated && (
                <Chip
                  className="mt-4"
                  color="warning"
                  radius="sm"
                  size="sm"
                  title={MESSAGES.deprecatedOperation}
                  variant="flat"
                >
                  Deprecated
                </Chip>
              )}

              <section className="mt-6">
                <OperationTabs operation={operationFocused} />
              </section>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom Panel Area - Resizable height */}
      <OperationBottomBar />
    </section>
  );
}
