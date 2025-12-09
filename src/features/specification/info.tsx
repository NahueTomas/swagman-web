import { useMemo } from "react";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { useStore } from "@/hooks/use-store";
import { Error } from "@/shared/components/ui/error";
import { SanitizedMarkdown } from "@/shared/components/ui/sanitized-markdown";
import {
  AnchorIcon,
  DocumentTextIcon,
  EmailIcon,
  OperationsIcon,
  ScaleIcon,
  UserIcon,
  UsersIcon,
  ThunderIcon,
} from "@/shared/components/ui/icons";

export default function Info() {
  const { spec } = useStore();

  // Memoize expensive values before the early return
  const operationCount = useMemo(
    () => spec?.getOperations()?.length || 0,
    [spec]
  );
  const tagCount = useMemo(() => spec?.getTagList()?.length || 0, [spec]);

  if (!spec?.info) return <Error message="No info found" title="Error" />;
  const { title, version, contact, license, description } = spec?.info;

  return (
    <section className="p-8 transition-all duration-250 h-full flex flex-col gap-8 overflow-auto">
      <div className="transition-all duration-250">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="font-bold text-4xl">{title}</h1>
              <Chip color="secondary" radius="sm" variant="flat">
                v{version}
              </Chip>
            </div>
          </div>

          <Chip
            color="primary"
            radius="sm"
            startContent={<ThunderIcon className="size-4" />}
            variant="flat"
          >
            <span>{operationCount} Operations</span>
          </Chip>

          <Chip
            color="primary"
            radius="sm"
            startContent={<OperationsIcon className="size-4" />}
            variant="flat"
          >
            <span>{tagCount} Tags</span>
          </Chip>
        </div>
      </div>

      <Divider className="bg-divider" />

      {description && (
        <SanitizedMarkdown
          className="text-md space-y-4 marked-lg"
          content={description}
        />
      )}

      {(contact || license) && (
        <>
          <Divider className="mt-auto bg-divider" />

          <div className="flex flex-col md:flex-row gap-2 text-sm">
            {contact && (
              <div className="p-4 border border-divider space-y-4 rounded-lg">
                <p className="flex items-center gap-2">
                  <UsersIcon className="size-4" />
                  <span>Contact Information</span>
                </p>
                {contact.name && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4" />
                    <span>{contact.name}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <EmailIcon className="size-4" />
                    <a
                      className="hover:underline"
                      href={`mailto:${contact.email}`}
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.url && (
                  <div className="flex items-center gap-2">
                    <AnchorIcon className="size-4" />
                    <a
                      className="hover:underline"
                      href={contact.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {contact.url}
                    </a>
                  </div>
                )}
              </div>
            )}

            {license && (
              <div className="p-4 border border-divider space-y-4 rounded-lg">
                <p className="mb-3 flex items-center gap-2">
                  <ScaleIcon className="size-4" />
                  <span>License</span>
                </p>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="size-4" />
                  <span>{license.name}</span>
                </div>
                {license.url && (
                  <div className="flex items-center gap-2">
                    <AnchorIcon className="size-4" />
                    <a
                      className="hover:underline"
                      href={license.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>View License</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
