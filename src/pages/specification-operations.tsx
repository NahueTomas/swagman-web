import { useStore } from "@/hooks/use-store";
import { SelectOperation } from "@/components/operation/select-operation";
import { Header } from "@/components/operation/header";
import { CardMd } from "@/components/card-md";
import { Collapse } from "@/components/collapse";
import { OperationTabs } from "@/components/operation/operation-tabs";

export default function SpecificationOperationsPage() {
  const { operationFocused, isFocusModeEnabled } = useStore();

  if (!operationFocused) {
    return <SelectOperation />;
  }

  return (
    <section className="relative overflow-y-auto h-full bg-content1/60">
      <Header />

      <div className="overflow-auto px-8 pt-px pb-4">
        <section className="flex flex-col">
          {operationFocused.summary && (
            <h2 className="text-md">{operationFocused.summary}</h2>
          )}
          {operationFocused.description && (
            <Collapse active={!isFocusModeEnabled}>
              <CardMd
                className="w-fit mt-6"
                markdown={operationFocused.description}
              />
            </Collapse>
          )}

          <section className="mt-8">
            <OperationTabs operation={operationFocused} />
          </section>
        </section>
      </div>
    </section>
  );
}
