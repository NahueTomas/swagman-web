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
        {/* 2. Secondary Info - Condensed & Low Contrast */}
        {(operationFocused.summary || operationFocused.description) && (
          <header className="px-6 py-3 border-b border-divider/30 bg-background-500/50">
            <div className="flex flex-col gap-1 max-w-6xl">
              {operationFocused.summary && (
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground-400">
                  {operationFocused.summary}
                </h2>
              )}
              {operationFocused.description && (
                <p className="text-[11px] text-foreground-500 line-clamp-1 hover:line-clamp-none transition-all cursor-help italic">
                  {operationFocused.description}
                </p>
              )}
            </div>
          </header>
        )}

        {/* 3. The Functional Core (Request Builder) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-2">
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
