import { useStore } from "@/hooks/use-store";
import { SelectOperation } from "@/features/operation/select-operation";
import { OperationHeader } from "@/features/operation/operation-header";
import { OperationTabs } from "@/features/operation/operation-tabs";
import { OperationBottomBar } from "@/features/operation/operation-bottom-bar";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) {
    return <SelectOperation />;
  }

  return (
    <section className="relative overflow-y-auto h-full flex flex-col select-none">
      <OperationHeader />

      <div className="flex p-8 flex-1">
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
      <div className="mt-auto sticky bottom-0 z-50 bg-background">
        <OperationBottomBar />
      </div>
    </section>
  );
}
