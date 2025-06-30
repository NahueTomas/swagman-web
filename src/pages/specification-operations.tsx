import { useStore } from "@/hooks/use-store";
import { SelectOperation } from "@/components/operation/select-operation";
import { Header } from "@/components/operation/header";
import { OperationTabs } from "@/components/operation/operation-tabs";
import { OperationBottomBar } from "@/components/operation/operation-bottom-bar";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) {
    return <SelectOperation />;
  }

  return (
    <section className="relative overflow-y-auto h-full flex flex-col">
      <Header />

      <div className="flex px-8 pt-8 pb-4 flex-1">
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
