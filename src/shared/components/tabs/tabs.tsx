import React, {
  useId,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
} from "react";

import { cn } from "@/shared/utils/cn";

interface TabProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isDisabled?: boolean;
}

interface TabsProps {
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  children:
    | React.ReactElement<TabProps>
    | React.ReactElement<TabProps>[]
    | (React.ReactElement<TabProps> | false | null | undefined)[];
  "aria-label"?: string;
  className?: string;
  classNames?: {
    tabList?: string;
    panel?: string;
    button?: string;
  };
}

export const Tabs = ({
  selectedKey,
  onSelectionChange,
  children,
  "aria-label": ariaLabel,
  className,
  classNames,
}: TabsProps) => {
  const tabs = React.Children.toArray(
    children
  ) as React.ReactElement<TabProps>[];

  // React.Children.toArray prefixes keys with ".$", strip it for clean matching
  const normalizeKey = (key: string | null | undefined) =>
    key?.replace(/^\.\$/, "") ?? "";
  const baseId = useId();

  // Refs for measuring tab positions
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const hasAnimated = useRef(false);

  // Compute effective key synchronously so the first tab is selected on initial render
  const effectiveKey = useMemo(() => {
    const validKeys = tabs.map((t) => normalizeKey(t.key));

    if (selectedKey && validKeys.includes(selectedKey)) {
      return selectedKey;
    }

    const firstTab = tabs.find((t) => !t.props.isDisabled);

    return normalizeKey(firstTab?.key) || selectedKey;
  }, [selectedKey, tabs]);

  // Notify the parent when the effective key differs from the passed-in key
  useEffect(() => {
    if (effectiveKey !== selectedKey) {
      onSelectionChange(effectiveKey);
    }
  }, [effectiveKey, selectedKey, onSelectionChange]);

  // Measure active tab and update indicator position
  useLayoutEffect(() => {
    const activeButton = tabRefs.current.get(effectiveKey);
    const tabList = tabListRef.current;

    if (activeButton && tabList) {
      const listRect = tabList.getBoundingClientRect();
      const btnRect = activeButton.getBoundingClientRect();

      setIndicator({
        left: btnRect.left - listRect.left,
        width: btnRect.width,
      });

      // Enable transitions after first paint
      if (!hasAnimated.current) {
        requestAnimationFrame(() => {
          hasAnimated.current = true;
        });
      }
    }
  }, [effectiveKey, children]);

  const activeTab = tabs.find((tab) => normalizeKey(tab.key) === effectiveKey);

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        aria-label={ariaLabel}
        className={cn(
          "relative flex items-center gap-1 border-b border-divider/50 w-full",
          classNames?.tabList
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const tabKey = normalizeKey(tab.key);
          const isActive = effectiveKey === tabKey;
          const { isDisabled } = tab.props;

          return (
            <button
              key={tabKey}
              ref={(el) => {
                if (el) tabRefs.current.set(tabKey, el);
              }}
              aria-controls={`${baseId}-panel-${tabKey}`}
              aria-selected={isActive}
              className={cn(
                "group relative h-10 px-6 flex items-center justify-center transition-colors duration-200 outline-none",
                "text-xxs font-semibold uppercase tracking-[0.12em]",
                isActive
                  ? "text-primary-500"
                  : "text-foreground-500 hover:text-foreground-200",
                isDisabled && "opacity-20 cursor-not-allowed",
                classNames?.button
              )}
              disabled={isDisabled}
              id={`${baseId}-tab-${tabKey}`}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelectionChange(tabKey);
              }}
              onKeyDown={(e) => {
                const enabledTabs = tabs.filter((t) => !t.props.isDisabled);
                const currentIdx = enabledTabs.findIndex(
                  (t) => normalizeKey(t.key) === tabKey
                );

                let targetIdx = -1;

                if (e.key === "ArrowRight") {
                  targetIdx = (currentIdx + 1) % enabledTabs.length;
                } else if (e.key === "ArrowLeft") {
                  targetIdx =
                    (currentIdx - 1 + enabledTabs.length) % enabledTabs.length;
                } else if (e.key === "Home") {
                  targetIdx = 0;
                } else if (e.key === "End") {
                  targetIdx = enabledTabs.length - 1;
                }

                if (targetIdx >= 0) {
                  e.preventDefault();
                  const targetKey = normalizeKey(enabledTabs[targetIdx].key);

                  onSelectionChange(targetKey);
                  tabRefs.current.get(targetKey)?.focus();
                }
              }}
            >
              {tab.props.title}

              {!isActive && !isDisabled && (
                <div className="absolute inset-0 bg-foreground-100/0 group-hover:bg-foreground-100/5 transition-colors duration-200" />
              )}
            </button>
          );
        })}

        {/* Sliding indicator */}
        <div
          className={cn(
            "absolute bottom-[-1px] h-[2px] bg-primary-500 z-20",
            hasAnimated.current
              ? "transition-all duration-300 ease-out"
              : "transition-none"
          )}
          style={{
            left: indicator.left,
            width: indicator.width,
            boxShadow: "0 -2px 10px rgba(190, 151, 110, 0.4)",
          }}
        />
      </div>

      {/* Tab Panel */}
      <div
        aria-labelledby={`${baseId}-tab-${effectiveKey}`}
        className={cn(
          "animate-in fade-in slide-in-from-top-1 duration-300 outline-none",
          classNames?.panel
        )}
        id={`${baseId}-panel-${effectiveKey}`}
        role="tabpanel"
        tabIndex={0}
      >
        {/* Render children only if activeTab exists */}
        {activeTab ? activeTab.props.children : null}
      </div>
    </div>
  );
};

export const Tab = ({ children }: TabProps) => <>{children}</>;
