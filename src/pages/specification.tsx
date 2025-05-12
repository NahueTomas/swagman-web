import { useEffect, useState } from "react";
import { marked } from "marked";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { useStore } from "@/hooks/use-store";
import { Error } from "@/components/error";
import {
  AnchorIcon,
  DocumentTextIcon,
  EmailIcon,
  OperationsIcon,
  ScaleIcon,
  UserIcon,
  UsersIcon,
  ThunderIcon,
} from "@/components/icons";

export default function SpecificationPage() {
  const { spec } = useStore();
  const [parsedDescription, setParsedDescription] = useState("");

  // Parse the description as markdown when it changes
  useEffect(() => {
    if (description) {
      try {
        // Configure marked for secure rendering
        const renderer = new marked.Renderer();

        // Set security options
        marked.setOptions({
          renderer,
          gfm: true,
          breaks: true,
          silent: true,
        });

        // Parse the description
        const html = marked.parse(description);

        setParsedDescription(typeof html === "string" ? html : "");
      } catch (_) {
        setParsedDescription(JSON.stringify(_));
      }
    }
  }, [spec?.info?.description]);

  if (!spec?.info) return <Error message="No info found" title="Error" />;
  const { title, version, contact, license, description } = spec?.info;

  const operationCount = spec.getOperations().length;
  const tagCount = spec.getTagList().length;

  return (
    <div className="p-8 transition-all duration-200 h-full flex flex-col gap-8 overflow-auto">
      <div className="transition-all duration-200">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="font-bold text-4xl">{title}</h1>
              <Chip color="secondary" variant="flat">
                v{version}
              </Chip>
            </div>
          </div>

          <Chip
            color="primary"
            startContent={<ThunderIcon className="size-4" />}
            variant="flat"
          >
            <span>{operationCount} Operations</span>
          </Chip>

          <Chip
            color="primary"
            startContent={<OperationsIcon className="size-4" />}
            variant="flat"
          >
            <span>{tagCount} Tags</span>
          </Chip>
        </div>
      </div>

      <Divider />

      {description && (
        <div
          dangerouslySetInnerHTML={{ __html: parsedDescription }}
          className="text-md space-y-4 marked"
        />
      )}

      {(contact || license) && (
        <>
          <Divider className="mt-auto" />

          <div className="flex flex-col md:flex-row gap-2 text-sm">
            {contact && (
              <Card
                className="p-4 bg-background border border-divider space-y-4"
                shadow="none"
              >
                <p className="font-medium flex items-center gap-2">
                  <UsersIcon className="size-5" />
                  <span>Contact Information</span>
                </p>
                {contact.name && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-5" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <EmailIcon className="size-5" />
                    <a
                      className="font-medium text-base hover:underline"
                      href={`mailto:${contact.email}`}
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.url && (
                  <div className="flex items-center gap-2">
                    <AnchorIcon className="size-5" />
                    <a
                      className="font-medium text-base hover:underline"
                      href={contact.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {contact.url}
                    </a>
                  </div>
                )}
              </Card>
            )}

            {license && (
              <Card
                className="p-4 bg-background border border-divider space-y-4"
                shadow="none"
              >
                <p className="font-medium mb-3 flex items-center gap-2">
                  <ScaleIcon className="size-5" />
                  <span>License</span>
                </p>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="size-5" />
                  <span className="font-medium">{license.name}</span>
                </div>
                {license.url && (
                  <div className="flex items-center gap-2">
                    <AnchorIcon className="size-5" />
                    <a
                      className="font-medium text-base hover:underline"
                      href={license.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>View License</span>
                    </a>
                  </div>
                )}
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
