import { useStore } from "@/hooks/use-store";
import { SelectOperation } from "@/components/operation/select-operation";
import { Header } from "@/components/operation/header";

export default function SpecificationOperationsPage() {
  const { operationFocused } = useStore();

  if (!operationFocused) {
    return <SelectOperation />;
  }

  return (
    <section className="relative overflow-y-auto h-full">
      <Header />

      <div className="overflow-auto p-8">
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
        <h1 className="text-2xl font-bold">Operation Header</h1>
      </div>
    </section>
  );
}
