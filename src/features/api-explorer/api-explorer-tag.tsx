import { useState } from "react";

import { Collapse } from "@/shared/components/collapse";
import { ChevronDownIcon } from "@/shared/components/icons";
import { cn } from "@/shared/utils/cn";
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
        className="w-full flex items-center gap-3 py-2 px-3 transition-colors rounded-md text-foreground-400 hover:text-foreground-100 hover:bg-white/5 active:scale-[0.99] group"
        type="button"
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          if (isCollapsed && tag.operationsResume.length)
            focusOperation(tag.operationsResume[0].id);
        }}
      >
        <ChevronDownIcon
          className={cn(
            "size-3 shrink-0 transition-transform duration-200 group-hover:text-primary-400",
            isCollapsed ? "-rotate-90" : "rotate-0"
          )}
        />

        <div className="flex-1 min-w-0 text-left overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold truncate group-hover:text-primary-50 transition-colors">
              {tag.title}
            </h4>
            <span className="text-[10px] bg-background-400/30 px-1.5 py-0.5 rounded font-mono font-bold text-foreground-500 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors shrink-0">
              {tag.operationsResume.length}
            </span>
          </div>

          {tag.description && (
            <p className="mt-0.5 text-xxs truncate text-foreground-600">
              {tag.description}
            </p>
          )}
        </div>
      </button>

      <Collapse active={!isCollapsed} duration={100} variant="zoom">
        <ul className="space-y-px mt-px">
          {tag.operationsResume.length ? (
            tag.operationsResume.map((o) => (
              <ApiExplorerTaggedItem
                key={o.id}
                active={o.id === operationFocusedId}
                className="pl-[1.8rem] pr-3"
                deprecated={o.deprecated}
                method={o.method}
                title={o.title}
                onClick={() => focusOperation(o.id)}
              />
            ))
          ) : (
            <p className="px-6 py-3 text-xxs text-foreground-600">
              No operations available
            </p>
          )}
        </ul>
      </Collapse>
    </div>
  );
};
