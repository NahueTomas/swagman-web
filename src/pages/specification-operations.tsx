import { useStore } from "@/hooks/use-store";
import { OperationHeader } from "@/features/operation/operation-header";
import { OperationTabs } from "@/features/operation/operation-tabs";
import { OperationBottomBar } from "@/features/operation/operation-bottom-bar";
import Info from "@/features/specification/info";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) return <Info />;

  return (
    <section className="relative h-full flex flex-col select-none">
      <OperationHeader />

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 lg:p-8">
          <div className="flex h-full">
            <section className="flex flex-col w-full">
              {operationFocused.summary && (
                <h2 className="text-md">{operationFocused.summary}</h2>
              )}
              {operationFocused.description && (
                <div className="text-tiny font-semibold text-content4 mt-1">
                  {operationFocused.description}
                </div>
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
