import React, { useCallback, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";

import { ApiExplorerTagList } from "./api-explorer-tag-list";

import {
  OperationsIcon,
  InfoIcon,
  ThunderIcon,
} from "@/shared/components/ui/icons";
import { Resizable } from "@/shared/components/ui/resizable";

const ICON_STYLES = "text-lg";

interface ApiExplorerItemProps {
  icon: React.ReactNode;
  to: string;
  title: string;
  isActive?: boolean;
}

const ApiExplorerItem = React.memo(
  ({ icon, to, title, isActive = false }: ApiExplorerItemProps) => {
    const getClassName = useCallback(
      () =>
        clsx(
          "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer",
          {
            "bg-primary-100 text-primary-700": isActive,
            "hover:bg-gray-100 hover:text-primary-500": !isActive,
          }
        ),
      [isActive]
    );

    return (
      <NavLink 
        className={getClassName} 
        to={to}
        aria-label={title}
        title={title}
      >
        <span className={ICON_STYLES} aria-hidden="true">{icon}</span>
      </NavLink>
    );
  }
);

ApiExplorerItem.displayName = "ApiExplorerItem";

interface ApiExplorerProps {
  className?: string;
}

export const ApiExplorer = React.memo(({ className }: ApiExplorerProps) => {
  const location = useLocation();
  const routes = useMemo(
    () => ({
      home: "/",
      specification: `/${location.pathname.split("/")[1]}`,
      operations: `/${location.pathname.split("/")[1]}/operations`,
    }),
    [location.pathname]
  );

  return (
    <aside className="flex h-full w-auto">
      <Card
        className={clsx(
          "flex flex-col h-full p-3 space-y-3 bg-background",
          className
        )}
        radius="none"
        shadow="none"
      >
        <div className="flex items-center">
          <ApiExplorerItem
            icon={<ThunderIcon className="size-6" />}
            title="Home"
            isActive={location.pathname === routes.home}
            to={routes.home}
          />
        </div>

        <Divider />

        <nav className="flex-1 space-y-1">
          <ApiExplorerItem
            icon={<InfoIcon className="size-6" />}
            title="Specification Info"
            isActive={location.pathname === routes.specification}
            to={routes.specification}
          />

          <ApiExplorerItem
            icon={<OperationsIcon className="size-6" />}
            title="API Operations"
            isActive={location.pathname === routes.operations}
            to={routes.operations}
          />
        </nav>
      </Card>

      {location.pathname === routes.operations && (
        <>
          <Divider orientation="vertical" />

          <Resizable axis="x" defaultWidth={300}>
            <Card
              className={clsx(
                "flex flex-col h-full space-y-3 bg-background",
                className
              )}
              radius="none"
              shadow="none"
            >
              <ApiExplorerTagList className="overflow-y-auto h-full" />
            </Card>
          </Resizable>
        </>
      )}
    </aside>
  );
});

ApiExplorer.displayName = "ApiExplorer";
