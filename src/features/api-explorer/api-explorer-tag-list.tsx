import React from "react";

import { useStore } from "@/hooks/use-store";
import { ApiExplorerTag } from "@/features/api-explorer/api-explorer-tag";

export const ApiExplorerTagList = React.memo(
  ({
    operationFocusedId,
    focusOperation,
    className,
  }: {
    operationFocusedId: string | null;
    focusOperation: (operationId: string | null) => void;
    className?: string;
  }) => {
    const tagList = useStore((state) => state.spec?.getTagList() || []);

    return (
      <div className={className}>
        {tagList.map((t) => (
          <ApiExplorerTag
            key={t.title}
            focusOperation={focusOperation}
            operationFocusedId={operationFocusedId}
            tag={t}
          />
        ))}
      </div>
    );
  }
);

ApiExplorerTagList.displayName = "ApiExplorerTagList";
