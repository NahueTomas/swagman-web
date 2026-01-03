import { useMemo } from "react";

import { useStore } from "@/hooks/use-store";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";
import {
  AnchorIcon,
  EmailIcon,
  OperationsIcon,
  ScaleIcon,
  UserIcon,
  ThunderIcon,
} from "@/shared/components/icons";
import { cn } from "@/shared/utils/cn";

export default function Info() {
  const { spec } = useStore();

  const operationCount = useMemo(
    () => spec?.getOperations()?.length || 0,
    [spec]
  );
  const tagCount = useMemo(() => spec?.getTagList()?.length || 0, [spec]);

  if (!spec?.info) return null;
  const { title, version, contact, license, description } = spec.info;

  return (
    <section className="h-full flex flex-col overflow-auto bg-background selection:bg-primary-500/30">
      {/* 1. Header Section - Dense & High Contrast */}
      <header className="px-8 py-10 border-b border-divider/40 bg-background-500/20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-foreground-100 uppercase italic">
                  {title}
                </h1>
                <span className="px-2 py-0.5 rounded border border-primary-500/30 bg-primary-500/10 text-primary-400 text-[10px] font-bold tracking-widest uppercase">
                  v{version}
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground-700">
                Specification Overview
              </p>
            </div>

            {/* Stats Grid */}
            <div className="flex gap-4">
              <div className="flex flex-col items-end px-4 border-r border-divider/50">
                <span className="text-2xl font-mono font-bold text-foreground-100">
                  {operationCount}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground-500 flex items-center gap-1.5">
                  <ThunderIcon className="size-3 text-primary-500" /> Operations
                </span>
              </div>
              <div className="flex flex-col items-end px-4">
                <span className="text-2xl font-mono font-bold text-foreground-100">
                  {tagCount}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground-500 flex items-center gap-1.5">
                  <OperationsIcon className="size-3 text-primary-500" /> Tags
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Content Body */}
      <div className="flex-1 px-8 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Description */}
          <main
            className={cn("lg:col-span-2 space-y-6", !description && "hidden")}
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-700 border-b border-divider/30 pb-2">
              Documentation
            </h3>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground-100 prose-p:text-foreground-500 prose-a:text-primary-500">
              <SanitizedMarkdown
                className="marked-lg leading-relaxed"
                content={description || ""}
              />
            </div>
          </main>

          {/* Sidebar Metadata */}
          <aside className="space-y-8">
            {/* Contact Card */}
            {contact && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-700 border-b border-divider/30 pb-2">
                  Maintainer
                </h3>
                <div className="space-y-3 p-4 rounded bg-background-500/40 border border-divider/20">
                  {contact.name && (
                    <div className="flex items-center gap-3 text-xs">
                      <UserIcon className="size-3.5 text-primary-500" />
                      <span className="font-bold text-foreground-200">
                        {contact.name}
                      </span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-3 text-xs group">
                      <EmailIcon className="size-3.5 text-foreground-500 group-hover:text-primary-500 transition-colors" />
                      <a
                        className="text-foreground-500 hover:text-foreground-100 truncate"
                        href={`mailto:${contact.email}`}
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.url && (
                    <div className="flex items-center gap-3 text-xs group">
                      <AnchorIcon className="size-3.5 text-foreground-500 group-hover:text-primary-500 transition-colors" />
                      <a
                        className="text-foreground-500 hover:text-foreground-100 truncate underline decoration-divider"
                        href={contact.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        External Portal
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* License Card */}
            {license && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground-700 border-b border-divider/30 pb-2">
                  Legal
                </h3>
                <div className="p-4 rounded border border-divider/20 flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-xs">
                    <ScaleIcon className="size-3.5 text-foreground-500" />
                    <span className="text-foreground-300 italic">
                      {license.name}
                    </span>
                  </div>
                  {license.url && (
                    <a
                      className="text-[10px] uppercase tracking-widest text-primary-500 hover:text-primary-400 font-bold mt-2"
                      href={license.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View Terms &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
