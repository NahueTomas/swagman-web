import type { OpenAPISchema } from "@/shared/types/openapi";

import { useMemo, useState } from "react";

import { useStore } from "@/hooks/use-store";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";
import { Collapse } from "@/shared/components/collapse";
import { Code } from "@/shared/components/code";
import {
  AnchorIcon,
  ChevronDownIcon,
  EmailIcon,
  OperationsIcon,
  ScaleIcon,
  SchemaIcon,
  UserIcon,
  ThunderIcon,
} from "@/shared/components/icons";
import { cn } from "@/shared/utils/cn";
import { Chip } from "@/shared/components/chip";
import { SectionTitle } from "@/shared/components/section-title";
import { Subtitle } from "@/shared/components/subtitle";
import {
  getBodyExample,
  resolveTypeLabel,
  typeChipVariant,
} from "@/shared/utils/openapi";

/* ------------------------------------------------------------------ */
/*  Property Row                                                      */
/* ------------------------------------------------------------------ */

const PropertyRow = ({
  name,
  schema,
  required,
}: {
  name: string;
  schema: OpenAPISchema;
  required: boolean;
}) => {
  const typeLabel = resolveTypeLabel(schema);
  const hasEnum = schema.enum && schema.enum.length > 0;

  return (
    <div className="flex items-start gap-3 px-3 py-2.5">
      {/* Name + required */}
      <div className="w-1/4 shrink-0 min-w-0">
        <span className="font-mono text-[11px] font-bold text-foreground-200 break-all">
          {name}
        </span>
        {required && (
          <span className="ml-1.5 text-[8px] font-black uppercase tracking-wider text-danger-400 align-top">
            *
          </span>
        )}
      </div>

      {/* Type chip */}
      <div className="shrink-0">
        <Chip
          className="font-mono"
          label={schema.format ? `${typeLabel}·${schema.format}` : typeLabel}
          radius="sm"
          size="xxs"
          variant={typeChipVariant(typeLabel)}
        />
      </div>

      {/* Description + enum */}
      <div className="flex-1 min-w-0 space-y-1">
        {schema.description && (
          <p className="text-[11px] text-foreground-500 leading-relaxed">
            {schema.description}
          </p>
        )}
        {hasEnum && (
          <div className="flex flex-wrap gap-1">
            {schema.enum!.map((v, i) => (
              <Chip
                key={i}
                className="font-mono"
                label={String(v)}
                radius="sm"
                size="xxs"
                variant="ghost-default"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Schema Card                                                       */
/* ------------------------------------------------------------------ */

interface SchemaCardProps {
  name: string;
  schema: OpenAPISchema;
}

const SchemaCard = ({ name, schema }: SchemaCardProps) => {
  const [open, setOpen] = useState(false);

  const properties = schema.properties ? Object.entries(schema.properties) : [];
  const requiredSet = useMemo(
    () => new Set(schema.required ?? []),
    [schema.required]
  );

  const example = useMemo(() => getBodyExample(schema, "json"), [schema]);

  const typeLabel = resolveTypeLabel(schema);
  const propCount = properties.length;

  return (
    <div className="rounded-lg border border-divider bg-background-500/10">
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDownIcon
          className={cn(
            "size-3 text-foreground-600 transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        />

        <span className="font-mono text-xs font-bold text-foreground-200 truncate">
          {name}
        </span>

        {/* Inline meta badges */}
        <Chip
          className="font-mono shrink-0"
          label={typeLabel}
          radius="sm"
          size="xxs"
          variant={typeChipVariant(typeLabel)}
        />

        {propCount > 0 && (
          <span className="text-[9px] font-mono text-foreground-600 shrink-0">
            {propCount} prop{propCount !== 1 && "s"}
          </span>
        )}

        {/* Description preview — right side */}
        {schema.description && !open && (
          <span className="ml-auto text-[10px] text-foreground-700 truncate max-w-[40%] hidden lg:block">
            {schema.description}
          </span>
        )}
      </button>

      {/* Expanded body */}
      <Collapse active={open}>
        <div className="border-t border-white/[0.06]">
          {/* Description */}
          {schema.description && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs text-foreground-500 leading-relaxed">
                {schema.description}
              </p>
            </div>
          )}

          {/* Properties */}
          {properties.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <Subtitle as="span" size="micro">
                Properties ({propCount})
              </Subtitle>
              <div className="mt-2 divide-y divide-white/[0.04] rounded-md border border-white/[0.06] overflow-hidden bg-background-500/10">
                {properties.map(([propName, propSchema]) => (
                  <PropertyRow
                    key={propName}
                    name={propName}
                    required={requiredSet.has(propName)}
                    schema={propSchema}
                  />
                ))}
              </div>
            </div>
          )}

          {/* JSON Example */}
          {example && (
            <div className="px-4 pt-3 pb-4">
              <Subtitle as="span" size="micro">
                Example
              </Subtitle>
              <div className="mt-2">
                <Code language="json" value={example} />
              </div>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Schemas Section                                                   */
/* ------------------------------------------------------------------ */

const SchemasSection = ({
  schemas,
  schemaCount,
}: {
  schemas: { name: string; schema: OpenAPISchema }[];
  schemaCount: number;
}) => {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return schemas;

    const q = filter.toLowerCase();

    return schemas.filter(
      ({ name, schema }) =>
        name.toLowerCase().includes(q) ||
        (schema.description?.toLowerCase().includes(q) ?? false)
    );
  }, [schemas, filter]);

  return (
    <div className="px-6 py-10 border-t border-divider/50">
      <div className="flex items-center justify-between gap-4 border-b border-divider/30 pb-3">
        <SectionTitle>Schemas ({schemaCount})</SectionTitle>
        {schemaCount > 0 && (
          <input
            className="w-48 h-7 px-3 rounded-md bg-background-500/30 text-xs text-foreground-300 placeholder:text-foreground-700 outline-none focus:border-primary-500/40 transition-colors"
            placeholder="Filter schemas..."
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-xs text-foreground-600">
          No schemas match &quot;{filter}&quot;
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map(({ name, schema }) => (
            <SchemaCard key={name} name={name} schema={schema} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Info Page                                                         */
/* ------------------------------------------------------------------ */

export default function Info() {
  const { spec } = useStore();

  const operationCount = useMemo(
    () => spec?.getOperations()?.length || 0,
    [spec]
  );
  const tagCount = useMemo(() => spec?.getTagList()?.length || 0, [spec]);
  const schemas = useMemo(() => spec?.getSchemas() || [], [spec]);
  const schemaCount = schemas.length;

  if (!spec?.info) return null;
  const { title, version, contact, license, description } = spec.info;

  return (
    <section className="h-full flex flex-col overflow-auto bg-background selection:bg-primary-500/30">
      {/* 1. Header Section - Dense & High Contrast */}
      <header className="relative px-6 py-10 border-b border-divider/50 bg-background/50">
        {/* Ambient gradient mesh */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 10% 50%, #BE976E, transparent), radial-gradient(ellipse 40% 60% at 90% 20%, #7850B8, transparent)",
          }}
        />
        <div className="relative w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground-100 tracking-tight">
                  {title}
                </h1>
                <Chip
                  label={`v${version}`}
                  radius="sm"
                  size="sm"
                  variant="ghost-primary"
                />
              </div>
              <Subtitle as="p" className="text-primary-600" size="xxs">
                About this API
              </Subtitle>
            </div>

            {/* Stats Grid */}
            <div className="flex items-stretch rounded-lg border border-white/[0.05] bg-white/[0.02] divide-x divide-white/[0.05] overflow-hidden">
              {(
                [
                  {
                    value: operationCount,
                    label: "Operations",
                    icon: ThunderIcon,
                  },
                  { value: tagCount, label: "Tags", icon: OperationsIcon },
                  ...(schemaCount > 0
                    ? [
                        {
                          value: schemaCount,
                          label: "Schemas",
                          icon: SchemaIcon,
                        },
                      ]
                    : []),
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-3">
                  <Icon className="size-3.5 text-primary-600" />
                  <span className="text-lg font-mono font-bold text-foreground-200 tabular-nums">
                    {value}
                  </span>
                  <Subtitle as="span" size="micro">
                    {label}
                  </Subtitle>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Content Body */}
      <div className="flex-1 px-6 py-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Description */}
          <main
            className={cn("lg:col-span-2 space-y-6", !description && "hidden")}
          >
            <SectionTitle className="border-b border-divider/30 pb-3">
              Documentation
            </SectionTitle>
            <SanitizedMarkdown
              className="marked-lg text-foreground-500"
              content={description || ""}
            />
          </main>

          {/* Sidebar Metadata */}
          <aside className="space-y-8">
            {/* Contact Card */}
            {contact && (
              <div className="space-y-4">
                <SectionTitle className="border-b border-divider/30 pb-3">
                  Maintainer
                </SectionTitle>
                <div className="space-y-3 p-5 rounded-md bg-background-500/20 border border-divider/50">
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
                <SectionTitle className="border-b border-divider/30 pb-3">
                  Legal
                </SectionTitle>
                <div className="p-5 rounded-md border border-divider/50 flex flex-col gap-2 bg-background-500/20">
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

      {/* 3. Schemas Section */}
      {schemas.length > 0 && (
        <SchemasSection schemaCount={schemaCount} schemas={schemas} />
      )}
    </section>
  );
}
