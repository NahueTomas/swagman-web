import { memo, useMemo } from "react";

import { useStore } from "@/hooks/use-store";
import { ApiExplorerTag } from "@/features/api-explorer/api-explorer-tag";

export const ApiExplorerTagList = memo(
  ({
    operationFocusedId,
    focusOperation,
    className,
    searchQuery = "",
  }: {
    operationFocusedId: string | null;
    focusOperation: (operationId: string | null) => void;
    className?: string;
    searchQuery?: string;
  }) => {
    const tagList = useStore((state) => state.spec?.getTagList() || []);
    const specKey = useStore((state) => state.spec?.specKey || "");

    const filteredTags = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();

      if (!q) return tagList;

      return tagList
        .map((tag) => {
          const ops = tag.operationsResume.filter((o) => {
            const haystack =
              `${o.method} ${o.title} ${o.id} ${tag.title}`.toLowerCase();

            return haystack.includes(q);
          });

          return ops.length > 0 ? { ...tag, operationsResume: ops } : null;
        })
        .filter(Boolean) as typeof tagList;
    }, [tagList, searchQuery]);

    if (searchQuery && filteredTags.length === 0) {
      return (
        <p className="px-3 py-4 text-xxs text-foreground-600 text-center">
          No operations match &ldquo;{searchQuery}&rdquo;
        </p>
      );
    }

    return (
      <div className={className}>
        {filteredTags.map((t) => (
          <ApiExplorerTag
            key={t.title}
            focusOperation={focusOperation}
            forceExpanded={!!searchQuery}
            operationFocusedId={operationFocusedId}
            specKey={specKey}
            tag={t}
          />
        ))}
      </div>
    );
  }
);

ApiExplorerTagList.displayName = "ApiExplorerTagList";
