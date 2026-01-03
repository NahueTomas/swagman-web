import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface SanitizedMarkdownProps {
  content: string;
  className?: string;
}

// Configure marked options once
const markdownRenderer = new marked.Renderer();

marked.setOptions({
  renderer: markdownRenderer,
  gfm: true,
  breaks: true,
  silent: true,
});

export function SanitizedMarkdown({
  content,
  className = "",
}: SanitizedMarkdownProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content) return "";

    try {
      const html = marked.parse(content);
      const htmlString = typeof html === "string" ? html : "";

      // Sanitize HTML to prevent XSS attacks
      return DOMPurify.sanitize(htmlString, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "b",
          "i",
          "u",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "a",
          "code",
          "pre",
          "blockquote",
          "hr",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "img",
        ],
        ALLOWED_ATTR: ["href", "title", "target", "rel", "alt", "src", "class"],
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown | Error) {
      // eslint-disable-next-line no-console
      console.log({
        description: "Error to create description",
        color: "danger",
      });
    }
  }, [content]);

  if (!sanitizedHtml) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className={className}
    />
  );
}
