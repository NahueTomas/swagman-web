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
    <div className={`p-4 border border-content2 rounded-lg ${className}`}>
      <SanitizedMarkdown className={`marked-${size}`} content={markdown} />
    </div>
  );
};
