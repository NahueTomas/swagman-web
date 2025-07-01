import { useStore } from "@/hooks/use-store";
import { OperationSelectOperation } from "@/features/operation/operation-select-operation";
import { OperationHeader } from "@/features/operation/operation-header";
import { OperationTabs } from "@/features/operation/operation-tabs";
import { OperationBottomBar } from "@/features/operation/operation-bottom-bar";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) {
    return <OperationSelectOperation />;
  }

  return (
    <section className="relative h-full flex flex-col select-none">
      <OperationHeader />

      {/* Main Content Area - Takes remaining space after bottom panel */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex p-8 h-full">
          <section className="flex flex-col w-full">
            {operationFocused.summary && (
              <h2 className="text-md">{operationFocused.summary}</h2>
            )}
            {operationFocused.description && (
              <div className="text-sm text-foreground/50">
                Description: {operationFocused.description}
              </div>
            )}

            <section className="mt-8">
              <OperationTabs operation={operationFocused} />
            </section>
          </section>
        </div>
      </div>

      {/* Bottom Panel Area - Resizable height */}
      <OperationBottomBar />
    </section>
  );
}
