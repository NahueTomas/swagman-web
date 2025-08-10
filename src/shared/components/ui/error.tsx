import { Code } from "@heroui/code";

export function Error({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Code color="danger">{message}</Code>
      {children ? children : null}
    </div>
  );
}
