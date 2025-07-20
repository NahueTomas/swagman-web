import { Card } from "@heroui/card";
import { SanitizedMarkdown } from "./sanitized-markdown";

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
  return (
    <Card
      className={`p-4 border border-divider bg-content1 bg-opacity-15 ${className}`}
      shadow="none"
    >
      <SanitizedMarkdown 
        content={markdown} 
        className={`marked-${size}`} 
      />
    </Card>
  );
};
