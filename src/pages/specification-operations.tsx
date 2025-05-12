import { Divider } from "@heroui/divider";

import { useStore } from "@/hooks/use-store";
import { SelectOperation } from "@/components/operation/select-operation";
import { Header } from "@/components/operation/header";
import { CardMd } from "@/components/card-md";
import { Collapse } from "@/components/collapse";

export default function SpecificationOperationsPage() {
  const { operationFocused, isFocusModeEnabled } = useStore();

  if (!operationFocused) {
    return <SelectOperation />;
  }

  return (
    <section className="relative overflow-y-auto h-full">
      <Header />

      <div className="overflow-auto px-8 py-2">
        <section className="flex flex-col">
          {operationFocused.summary && (
            <h2 className="text-sm">{operationFocused.summary}</h2>
          )}
          {operationFocused.description && (
            <Collapse active={!isFocusModeEnabled}>
              <CardMd
                className="w-fit mt-6"
                markdown={operationFocused.description}
              />
            </Collapse>
          )}

          <Divider className="mt-6" />
        </section>
      </div>
    </section>
  );
}
