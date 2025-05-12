import { Code } from "@heroui/code";

export function Error({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Code color="danger">{message}</Code>
    </div>
  );
}
