import { useState } from "react";
import clsx from "clsx";

import { Collapse } from "@/shared/components/collapse";
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
    <div>
      <button
        className="w-full flex flex-wrap flex-row py-2 transition-all rounded-md hover:text-foreground-100"
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          if (isCollapsed && tag.operationsResume.length)
            focusOperation(tag.operationsResume[0].id);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 shrink-0">
            <svg
              className={clsx(
                "w-2.5 h-2.5 transform transition-transform duration-200",
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
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold truncate">{tag.title}</h4>
              <p className="text-xxs">
                ({String(tag.operationsResume.length)})
              </p>
            </div>

            {tag.description && (
              <div
                className="mt-0.5 text-xxs truncate overflow-hidden"
                title="description"
              >
                {tag.description}
              </div>
            )}
          </div>
        </div>
      </button>

      <Collapse active={!isCollapsed} duration={100} variant="zoom">
        <ul className="space-y-px mt-px">
          {tag.operationsResume.length ? (
            tag.operationsResume.map((o) => (
              <ApiExplorerTaggedItem
                key={o.id}
                active={o.id === operationFocusedId || false}
                className="px-6"
                deprecated={o.deprecated}
                method={o.method}
                title={o.title}
                onClick={() => focusOperation(o.id)}
              />
            ))
          ) : (
            <div className="px-6 py-3 text-xxs">No operations available</div>
          )}
        </ul>
      </Collapse>
    </div>
  );
};
