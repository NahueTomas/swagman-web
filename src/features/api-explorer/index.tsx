import React, { useCallback, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";

import { ThemeSwitch } from "./theme-switch";
import { ApiExplorerTagList } from "./api-explorer-tag-list";

import {
  OperationsIcon,
  InfoIcon,
  ThunderIcon,
} from "@/shared/components/ui/icons";
import { Resizable } from "@/shared/components/ui/resizable";

const ICON_STYLES = "text-lg";
const HOME_PATH = "/";

interface ApiExplorerItemProps {
  icon: React.ReactNode;
  to: string;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const ApiExplorerItem = React.memo(
  ({ icon, to, isActive = false, onClick }: ApiExplorerItemProps) => {
    // Memoized class name function
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

    // Keyboard event handler for accessibility
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick(e as unknown as React.MouseEvent);
        }
      },
      [onClick]
    );

    // If there is a custom onClick, use it instead of NavLink for faster navigation
    if (onClick) {
      return (
        <div
          aria-pressed={isActive}
          className={getClassName()}
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleKeyDown}
        >
          <span className={ICON_STYLES}>{icon}</span>
        </div>
      );
    }

    // Fallback to NavLink when there is no onClick
    return (
      <NavLink className={getClassName} to={to}>
        <span className={ICON_STYLES}>{icon}</span>
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
  const navigate = useNavigate();

  // Obtain information from the current path
  const { specUrl, isSpecificationPage, isOperationsPage, hasSpecUrl } =
    useMemo(() => {
      const pathname = location.pathname;

      const specUrlMatch = pathname.match(/\/specification\/([^/]+)(?:\/.*)?$/);
      const urlParam = specUrlMatch ? specUrlMatch[1] : "";
      const isOpsPage = pathname.includes("/operations");
      const isSpecPage = pathname.includes("/specification") && !isOpsPage;

      return {
        specUrl: urlParam,
        isSpecificationPage: isSpecPage,
        isOperationsPage: isOpsPage,
        hasSpecUrl: !!urlParam,
      };
    }, [location.pathname]);

  // Create routes only once for the entire component
  const routes = useMemo(
    () => ({
      home: HOME_PATH,
      specification: `/specification/${specUrl}`,
      operations: `/specification/${specUrl}/operations`,
    }),
    [specUrl]
  );

  // Direct navigation functions to avoid delays
  const handleClickHome = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(HOME_PATH);
    },
    [navigate]
  );

  const handleClickSpecification = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(`/specification/${specUrl}`);
    },
    [navigate, specUrl]
  );

  const handleClickOperations = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(`/specification/${specUrl}/operations`);
    },
    [navigate, specUrl]
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
            isActive={location.pathname === HOME_PATH}
            to={routes.home}
            onClick={handleClickHome}
          />
        </div>

        <Divider />

        <nav className="flex-1 space-y-1">
          {hasSpecUrl && (
            <>
              <ApiExplorerItem
                icon={<InfoIcon className="size-6" />}
                isActive={isSpecificationPage}
                to={routes.specification}
                onClick={handleClickSpecification}
              />

              <ApiExplorerItem
                icon={<OperationsIcon className="size-6" />}
                isActive={isOperationsPage}
                to={routes.operations}
                onClick={handleClickOperations}
              />
            </>
          )}
        </nav>

        <Divider />

        <div>
          <ThemeSwitch />
        </div>
      </Card>
      <Divider orientation="vertical" />
      {isOperationsPage && (
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
      )}
    </aside>
  );
});

ApiExplorer.displayName = "ApiExplorer";
