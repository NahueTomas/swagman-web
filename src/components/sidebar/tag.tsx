import { useState } from "react";

import { useStore } from "@/hooks/use-store";
import { Collapse } from "@/components/collapse";
import { TaggedItem } from "@/components/sidebar/tagged-item";

export const Tag = ({
  tag,
}: {
  tag: {
    title: string;
    description?: string;
    operationsResume: { id: string; title: string; method: string }[];
  };
}) => {
  const { focusOperation, operationFocused } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="border-b border-divider">
      <button
        className="w-full py-3 px-4 flex items-center gap-3 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="w-4 h-4">
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isCollapsed ? "rotate-0" : "rotate-90"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-left w-auto overflow-hidden">
          <h4 className="text-sm font-medium text-left flex items-center gap-2">
            {tag.title}
            <div className="text-[10px] font-medium px-2 rounded-md border border-divider">
              {tag.operationsResume.length}
            </div>
          </h4>
          {tag.description && (
            <p className="text-xs text-default-500 font-semibold mt-0.5 truncate">
              {tag.description}
            </p>
          )}
        </div>
      </button>

      <Collapse active={!isCollapsed} duration={150} variant="zoom">
        <ul>
          {tag.operationsResume.length ? (
            tag.operationsResume.map((o) => (
              <TaggedItem
                key={o.id}
                active={o.id === operationFocused?.id || false}
                method={o.method}
                title={o.title}
                onClick={() => focusOperation(o.id)}
              />
            ))
          ) : (
            <span className="block px-7 py-3 text-xs italic">
              No operations available
            </span>
          )}
        </ul>
      </Collapse>
    </div>
  );
};
