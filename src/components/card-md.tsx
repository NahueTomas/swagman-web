import { Card } from "@heroui/card";
import { marked } from "marked";
import { useEffect, useState } from "react";

type CardMdProps = {
  markdown: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export const CardMd = ({
  markdown,
  className = "",
  size = "sm",
}: CardMdProps) => {
  const [parsedMarkdown, setParsedMarkdown] = useState("");

  // Parse the description as markdown when it changes
  useEffect(() => {
    if (markdown) {
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
        const html = marked.parse(markdown);

        setParsedMarkdown(typeof html === "string" ? html : "");
      } catch (_) {
        setParsedMarkdown(JSON.stringify(_));
      }
    }
  }, [markdown]);

  return (
    <Card
      className={`p-4 border border-divider bg-content1 bg-opacity-15 marked-${size} ${className}`}
      shadow="none"
    >
      <div dangerouslySetInnerHTML={{ __html: parsedMarkdown }} />
    </Card>
  );
};
