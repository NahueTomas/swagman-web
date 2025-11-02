import { useState } from "react";
import { Chip } from "@heroui/chip";
import clsx from "clsx";

import { Collapse } from "@/shared/components/ui/collapse";
import { ApiExplorerTaggedItem } from "@/features/api-explorer/api-explorer-tagged-item";

export const ApiExplorerTag = ({
  tag,
  focusOperation,
  operationFocusedId,
}: {
  tag: {
    title: string;
    description?: string;
    operationsResume: {
      id: string;
      title: string;
      method: string;
      deprecated: boolean;
    }[];
  };
  focusOperation: (operationId: string | null) => void;
  operationFocusedId: string | null;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-1">
      <button
        className="w-full py-3 px-3 flex items-center gap-3 transition-all hover:bg-default-50 rounded-lg group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="w-4 h-4 shrink-0">
          <svg
            className={clsx(
              "w-4 h-4 transform transition-transform duration-200 text-default-500 group-hover:text-default-700",
              isCollapsed ? "rotate-0" : "rotate-90"
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex-1 text-left overflow-hidden">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-sm font-semibold text-default-900 truncate">
              {tag.title}
            </h4>
            <Chip
              className="text-[10px] h-5 px-1"
              color="default"
              size="sm"
              variant="flat"
            >
              {tag.operationsResume.length}
            </Chip>
          </div>
          {tag.description && (
            <p className="text-xs text-default-500 truncate">
              {tag.description}
            </p>
          )}
        </div>
      </button>

      <Collapse active={!isCollapsed} duration={200} variant="zoom">
        <ul className="space-y-1 p-1">
          {tag.operationsResume.length ? (
            tag.operationsResume.map((o) => (
              <ApiExplorerTaggedItem
                key={o.id}
                active={o.id === operationFocusedId || false}
                deprecated={o.deprecated}
                method={o.method}
                title={o.title}
                onClick={() => focusOperation(o.id)}
              />
            ))
          ) : (
            <li className="px-6 py-3 text-xs italic text-default-400">
              No operations available
            </li>
          )}
        </ul>
      </Collapse>
    </div>
  );
};
