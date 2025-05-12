import { Chip } from "@heroui/chip";

export const TaggedItem = ({
  title,
  method,
  active,
  onClick,
}: {
  title: string;
  method: string;
  active: boolean;
  onClick: () => void;
}) => {
  const methodUpper = method.toUpperCase();

  const methodColors: Record<string, string> = {
    GET: "primary",
    POST: "secondary",
    PUT: "warning",
    PATCH: "success",
    DELETE: "danger",
    DEFAULT: "default",
  };

  const colorSet = methodColors[methodUpper] || methodColors.DEFAULT;

  return (
    <li className="overflow-hidden">
      <button
        className={`w-full pl-6 pr-3 py-2.5 transition-colors duration-250 flex items-center gap-3 group relative border-transparent overflow-hidden ${
          active ? `bg-${colorSet}/10` : "hover:bg-content1"
        }`}
        onClick={onClick}
      >
        {/* Left bar indicating active state */}
        {active && (
          <div
            className={`bg-${colorSet} absolute left-0 top-0 bottom-0 w-1 animate-appearance-in`}
          />
        )}

        {/* Method indicator - adjusted padding */}
        <Chip
          color={
            colorSet as "primary" | "success" | "warning" | "danger" | "default"
          }
          radius="sm"
          size="sm"
          variant="flat"
        >
          <span className="text-[10px] flex">{methodUpper}</span>
        </Chip>

        {/* Operation title */}
        <span
          className={`text-xs truncate ${active ? "text-default-900" : "text-default-600"}`}
        >
          {title}
        </span>
      </button>
    </li>
  );
};
