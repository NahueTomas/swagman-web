import React, { useCallback, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";

import { ThemeSwitch } from "./theme-switch";
import { OperationsIcon, InfoIcon, ThunderIcon } from "./icons";
import { SidebarTagList } from "./sidebar-tag-list";
import { Resizable } from "./resizable";

// Constantes para reducir creación de objetos
const ICON_STYLES = "text-lg";
const HOME_PATH = "/";

interface SidebarItemProps {
  icon: React.ReactNode;
  to: string;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

// Componente con memoización para evitar renderizados innecesarios
const SidebarItem = React.memo(
  ({ icon, to, isActive = false, onClick }: SidebarItemProps) => {
    // Función de clase memoizada
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

    // Manejador para eventos de teclado para accesibilidad
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick(e as unknown as React.MouseEvent);
        }
      },
      [onClick]
    );

    // Si hay un onClick personalizado, lo usamos en lugar de NavLink para mayor rapidez
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

    // Fallback a NavLink cuando no hay onClick
    return (
      <NavLink className={getClassName} to={to}>
        <span className={ICON_STYLES}>{icon}</span>
      </NavLink>
    );
  }
);

// Asignar nombre para el display name
SidebarItem.displayName = "SidebarItem";

interface SidebarProps {
  className?: string;
}

export const Sidebar = React.memo(({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer información de la ruta actual de forma optimizada
  const { specUrl, isSpecificationPage, isOperationsPage, hasSpecUrl } =
    useMemo(() => {
      const pathname = location.pathname;

      // Extraemos la URL directamente de la ruta usando expresiones regulares
      // Esto es más rápido que dividir la cadena y buscar en el array resultante
      const specUrlMatch = pathname.match(/\/specification\/([^/]+)(?:\/.*)?$/);
      const urlParam = specUrlMatch ? specUrlMatch[1] : "";

      // Verificamos directamente los patrones en la ruta
      const isOpsPage = pathname.includes("/operations");
      const isSpecPage = pathname.includes("/specification") && !isOpsPage;

      return {
        specUrl: urlParam,
        isSpecificationPage: isSpecPage,
        isOperationsPage: isOpsPage,
        hasSpecUrl: !!urlParam,
      };
    }, [location.pathname]);

  // Creamos las rutas solo una vez para todo el componente
  const routes = useMemo(
    () => ({
      home: HOME_PATH,
      specification: `/specification/${specUrl}`,
      operations: `/specification/${specUrl}/operations`,
    }),
    [specUrl]
  );

  // Funciones de navegación directa para evitar retrasos
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
          <SidebarItem
            icon={<ThunderIcon />}
            isActive={location.pathname === HOME_PATH}
            to={routes.home}
            onClick={handleClickHome}
          />
        </div>

        <Divider />

        <nav className="flex-1 space-y-1">
          {hasSpecUrl && (
            <>
              <SidebarItem
                icon={<InfoIcon />}
                isActive={isSpecificationPage}
                to={routes.specification}
                onClick={handleClickSpecification}
              />

              <SidebarItem
                icon={<OperationsIcon />}
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
              "flex flex-col h-full space-y-3 bg-content1 bg-opacity-15",
              className
            )}
            radius="none"
            shadow="none"
          >
            <SidebarTagList className="overflow-y-auto h-full" />
          </Card>
        </Resizable>
      )}
    </aside>
  );
});

// Asignar nombre para el display name
Sidebar.displayName = "Sidebar";
