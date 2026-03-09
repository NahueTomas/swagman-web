import { useStore } from "@/hooks/use-store";
import { OperationHeader } from "@/features/operation/operation-header";
import { OperationTabs } from "@/features/operation/operation-tabs";
import { OperationBottomBar } from "@/features/operation/operation-bottom-bar";
import Info from "@/features/specification/info";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) return <Info />;

  return (
    <section className="relative w-full h-full flex flex-col bg-background overflow-hidden">
      {/* 1. Method and Endpoint (Sticky) */}
      <OperationHeader />

      <div className="flex-1 flex flex-col min-h-0">
        {/* 3. The Functional Core (Request Builder) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <OperationTabs operation={operationFocused} />
          </div>
        </main>
      </div>

      {/* 4. The Functional Core (Response) */}
      <footer className="shrink-0">
        <OperationBottomBar />
      </footer>
    </section>
  );
}
