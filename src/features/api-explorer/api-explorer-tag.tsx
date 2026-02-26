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
        className="w-full flex flex-wrap flex-row py-2 px-3 transition-colors rounded-md text-foreground-400 hover:text-foreground-100 hover:bg-white/5 active:scale-[0.99] group"
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
                "w-2.5 h-2.5 transform transition-transform duration-200 group-hover:text-primary-400",
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
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold truncate group-hover:text-primary-50 transition-colors">
                {tag.title}
              </h4>
              <span className="text-[10px] bg-background-400/30 px-1.5 py-0.5 rounded font-mono font-bold text-foreground-500 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                {tag.operationsResume.length}
              </span>
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
                className="pl-[1.8rem] pr-3"
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
