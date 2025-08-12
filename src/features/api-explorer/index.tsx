import React from "react";
import { useNavigate } from "react-router-dom";

import { ApiExplorerTagList } from "./api-explorer-tag-list";

import { InfoIcon, ThunderIcon } from "@/shared/components/ui/icons";
import { Resizable } from "@/shared/components/ui/resizable";
import { useStore } from "@/hooks/use-store";
import { ButtonSelectable } from "@/shared/components/ui/button-selectable";
import { ROUTES } from "@/shared/constants/constants";

export const ApiExplorer = React.memo(() => {
  const { operationFocused, focusOperation } = useStore();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-auto">
      <Resizable axis="x" defaultWidth={320}>
        <div className="relative flex flex-col overflow-y-auto h-full no-scrollbar">
          <div className="px-4 py-2 sticky top-0 z-10 border-b border-divider bg-background/50 backdrop-blur-md shadow-md">
            <ButtonSelectable
              active={operationFocused === null}
              onSelect={() => focusOperation(null)}
            >
              <InfoIcon className="size-4 shrink-0" />
              <span className="font-semibold">Specification Info</span>
            </ButtonSelectable>
          </div>

          <div className="px-4 py-2">
            <ApiExplorerTagList
              focusOperation={focusOperation}
              operationFocusedId={operationFocused?.id || null}
            />
          </div>

          <div className="bg-background/50 backdrop-blur-md shadow-md px-4 py-4 sticky bottom-0 mt-auto">
            {/* SPECIFICATION SELECTOR PAGE */}
            <button
              className="px-4 py-0.5 flex items-center gap-4 text-xs text-default-500 hover:text-default-700 transition-colors hover:underline"
              onClick={() => navigate(ROUTES.SPECIFICATION_SELECTOR)}
            >
              <ThunderIcon className="size-3" />
              <span>Go to select another specification</span>
            </button>
          </div>
        </div>
      </Resizable>
    </aside>
  );
});

ApiExplorer.displayName = "ApiExplorer";
