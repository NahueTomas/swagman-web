import React, { useId, useEffect } from "react";

import { cn } from "@/shared/utils/cn";

interface TabProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isDisabled?: boolean;
}

interface TabsProps {
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
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
  const baseId = useId();

  useEffect(() => {
    const validKeys = tabs.map((t) => t.key?.toString());

    if (!selectedKey || !validKeys.includes(selectedKey)) {
      const firstTab = tabs.find((t) => !t.props.isDisabled);

      if (firstTab && firstTab.key) {
        onSelectionChange(firstTab.key.toString());
      }
    }
  }, [selectedKey, tabs, onSelectionChange]);

  const activeTab = tabs.find((tab) => tab.key?.toString() === selectedKey);

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* Tab List */}
      <div
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-1 border-b border-divider/40 w-full",
          classNames?.tabList
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const tabKey = tab.key?.toString() || "";
          const isActive = selectedKey === tabKey;
          const { isDisabled } = tab.props;

          return (
            <button
              key={tabKey}
              aria-controls={`${baseId}-panel-${tabKey}`}
              aria-selected={isActive}
              className={cn(
                "group relative h-10 px-6 flex items-center justify-center transition-all outline-none",
                "text-xxs font-black uppercase tracking-[0.2em]",
                isActive
                  ? "text-primary-500"
                  : "text-foreground-500 hover:text-foreground-200",
                isDisabled && "opacity-20 cursor-not-allowed",
                classNames?.button
              )}
              disabled={isDisabled}
              id={`${baseId}-tab-${tabKey}`}
              role="tab"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelectionChange(tabKey);
              }}
            >
              {tab.props.title}

              {/* Indicator */}
              {isActive && (
                <div
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary-500 z-20"
                  style={{ boxShadow: "0 -2px 10px rgba(190, 151, 110, 0.4)" }}
                />
              )}

              {!isActive && !isDisabled && (
                <div className="absolute inset-0 bg-foreground-100/0 group-hover:bg-foreground-100/5 transition-colors duration-200" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        aria-labelledby={`${baseId}-tab-${selectedKey}`}
        className={cn(
          "animate-in fade-in slide-in-from-top-1 duration-300 outline-none",
          classNames?.panel
        )}
        id={`${baseId}-panel-${selectedKey}`}
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
