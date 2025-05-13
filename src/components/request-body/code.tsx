import { useEffect, useRef, useState } from "react";
import { EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { linter, Diagnostic } from "@codemirror/lint";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";

export enum CodeLanguage {
  JSON = "JSON",
  XML = "XML",
  TEXT = "TEXT",
}

export const Code = ({
  id,
  language = CodeLanguage.JSON,
  onChange,
  value,
  defaultValue,
}: {
  id: string;
  language: CodeLanguage;
  onChange: (value: string) => void;
  value?: string;
  defaultValue?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [hasError, setHasError] = useState(false);
  const heightRef = useRef("240px");

  // Flag para ignorar la próxima actualización de valor externo después de una edición local
  const ignoreNextExternalUpdate = useRef(false);

  // El valor inicial se determina una sola vez
  const initialValue = value !== undefined ? value : defaultValue || "";

  // Para saber si estamos en modo controlado o no
  const isControlled = value !== undefined;

  const handleReset = () => {
    if (editorViewRef.current) {
      onChange(defaultValue || "");
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: defaultValue || "",
        },
      });
    }
  };

  const handleClear = () => {
    if (editorViewRef.current) {
      onChange("");

      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: "",
        },
      });
    }
  };

  const handleResize = () => {
    if (containerRef.current) {
      heightRef.current = `${containerRef.current.clientHeight}px`;
    }
  };

  const jsonLinter = linter((view) => {
    if (language !== CodeLanguage.JSON) return [];

    const diagnostics: Diagnostic[] = [];

    try {
      const doc = view.state.doc.toString();

      if (doc.trim()) {
        JSON.parse(doc);
      }
      setHasError(false);
    } catch (e) {
      setHasError(true);
      if (e instanceof Error) {
        const match = e.message.match(/at position (\d+)/);

        if (match) {
          const pos = parseInt(match[1]);

          diagnostics.push({
            from: Math.max(0, pos - 1),
            to: pos + 1,
            severity: "error",
            message: e.message,
          });
        } else {
          diagnostics.push({
            from: 0,
            to: view.state.doc.length,
            severity: "error",
            message: e.message,
          });
        }
      }
    }

    return diagnostics;
  });

  const xmlLinter = linter((view) => {
    if (language !== CodeLanguage.XML) return [];

    const diagnostics: Diagnostic[] = [];
    const doc = view.state.doc.toString();

    // Skip empty documents
    if (!doc.trim()) {
      setHasError(false);

      return diagnostics;
    }

    try {
      // More comprehensive XML validation
      const errors = validateXml(doc);

      if (errors.length > 0) {
        setHasError(true);

        // Add diagnostics for each error
        errors.forEach((error) => {
          diagnostics.push({
            from: error.position || 0,
            to: (error.position || 0) + (error.length || 1),
            severity: "error",
            message: error.message,
          });
        });
      } else {
        setHasError(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Fallback to basic validation if advanced validation fails
      const openTagsMatch =
        doc.match(/<([a-zA-Z0-9_:-]+)(?:\s+[^>]*)?>/g) || [];
      const closeTagsMatch = doc.match(/<\/([a-zA-Z0-9_:-]+)>/g) || [];

      if (openTagsMatch.length !== closeTagsMatch.length) {
        setHasError(true);
        diagnostics.push({
          from: 0,
          to: view.state.doc.length,
          severity: "error",
          message: "Malformed XML: some tags are not closed",
        });
      } else {
        setHasError(false);
      }
    }

    return diagnostics;
  });

  // Validate XML and return errors
  const validateXml = (
    xml: string
  ): Array<{ message: string; position?: number; length?: number }> => {
    const errors: Array<{
      message: string;
      position?: number;
      length?: number;
    }> = [];

    try {
      // Skip validation for very simple XML
      if (xml.trim().length < 10) return [];

      // Store comment positions to avoid false positives
      const comments: Array<{ start: number; end: number }> = [];
      const commentRegex = /<!--([\s\S]*?)-->/g;
      let commentMatch;

      while ((commentMatch = commentRegex.exec(xml)) !== null) {
        comments.push({
          start: commentMatch.index,
          end: commentMatch.index + commentMatch[0].length,
        });
      }

      // Store CDATA positions to avoid false positives
      const cdataSections: Array<{ start: number; end: number }> = [];
      const cdataRegex = /<!\[CDATA\[([\s\S]*?)\]\]>/g;
      let cdataMatch;

      while ((cdataMatch = cdataRegex.exec(xml)) !== null) {
        cdataSections.push({
          start: cdataMatch.index,
          end: cdataMatch.index + cdataMatch[0].length,
        });
      }

      // Store processing instruction positions
      const processingInstructions: Array<{ start: number; end: number }> = [];
      const piRegex = /<\?([\s\S]*?)\?>/g;
      let piMatch;

      while ((piMatch = piRegex.exec(xml)) !== null) {
        processingInstructions.push({
          start: piMatch.index,
          end: piMatch.index + piMatch[0].length,
        });
      }

      // Check if a position is inside a comment, CDATA or processing instruction
      const isInProtectedSection = (position: number): boolean => {
        return (
          comments.some((c) => position >= c.start && position < c.end) ||
          cdataSections.some((c) => position >= c.start && position < c.end) ||
          processingInstructions.some(
            (p) => position >= p.start && position < p.end
          )
        );
      };

      // Find text content between tags that might need to be wrapped in its own tag
      const findOrphanedTextContent = () => {
        // Match text between a closing tag and an opening tag
        const orphanedTextRegex = /<\/([^>]+)>([\s]*[^<\s][^<]*?)(?=<[^\/])/g;
        let orphanMatch;

        while ((orphanMatch = orphanedTextRegex.exec(xml)) !== null) {
          const closingTag = orphanMatch[1];
          const orphanedText = orphanMatch[2];
          const position = orphanMatch.index + closingTag.length + 3; // +3 for </> characters

          // Skip if in protected section or if text is just whitespace
          if (
            !isInProtectedSection(position) &&
            orphanedText.trim().length > 0
          ) {
            errors.push({
              message: `Orphaned text found: "${orphanedText.trim()}" should be wrapped in a tag`,
              position: position,
              length: orphanedText.length,
            });
          }
        }
      };

      // Basic structure check
      // Count opening and closing tags (excluding self-closing)
      const tagPattern = /<(\/?)([a-zA-Z0-9_:-]+)([^>]*?)(\/?)>/g;
      const tags: {
        name: string;
        isOpening: boolean;
        isSelfClosing: boolean;
        position: number;
        length: number;
      }[] = [];

      let match;

      while ((match = tagPattern.exec(xml)) !== null) {
        const position = match.index;
        const tagLength = match[0].length;

        // Skip if in protected section
        if (isInProtectedSection(position)) continue;

        const isClosing = match[1] === "/";
        const tagName = match[2];
        const isSelfClosing = match[4] === "/" || match[3].trim().endsWith("/");

        tags.push({
          name: tagName,
          isOpening: !isClosing,
          isSelfClosing,
          position,
          length: tagLength,
        });
      }

      // Check tag nesting with stack
      const tagStack: {
        name: string;
        position: number;
        lastChildPosition?: number;
      }[] = [];

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        if (tag.isOpening) {
          if (!tag.isSelfClosing) {
            // For opening tags, track the last child's position for orphaned text detection
            if (tagStack.length > 0) {
              const parent = tagStack[tagStack.length - 1];

              parent.lastChildPosition = tag.position;
            }

            tagStack.push({ name: tag.name, position: tag.position });
          }
        } else {
          // Closing tag
          if (tagStack.length === 0) {
            errors.push({
              message: `Unexpected closing tag: </${tag.name}>`,
              position: tag.position,
              length: tag.length,
            });
          } else {
            const lastTag = tagStack.pop()!;

            // Check for orphaned text between this closing tag and its parent's next child
            if (tagStack.length > 0) {
              // If there's text between the end of this tag and the next sibling tag
              const nextSiblingPos =
                i < tags.length - 1 ? tags[i + 1].position : xml.length;
              const textBetween = xml
                .substring(tag.position + tag.length, nextSiblingPos)
                .trim();

              if (
                textBetween.length > 0 &&
                !textBetween.startsWith("<") &&
                !isInProtectedSection(tag.position + tag.length)
              ) {
                // This is orphaned text content
                errors.push({
                  message: `Orphaned text found: "${textBetween.substring(
                    0,
                    20
                  )}${
                    textBetween.length > 20 ? "..." : ""
                  }" should be wrapped in a tag`,
                  position: tag.position + tag.length,
                  length: textBetween.length,
                });
              }
            }

            if (lastTag.name !== tag.name) {
              errors.push({
                message: `Mismatched tag: expected </${lastTag.name}>, found </${tag.name}>`,
                position: tag.position,
                length: tag.length,
              });

              // Check if the closing tag matches any other open tag
              const matchingIndex = tagStack.findIndex(
                (t) => t.name === tag.name
              );

              if (matchingIndex >= 0) {
                // This means that we have improper nesting
                errors.push({
                  message: `Improper nesting: <${lastTag.name}> must be closed before </${tag.name}>`,
                  position: lastTag.position,
                  length: lastTag.name.length + 2,
                });

                // Remove the matching tag and all tags opened after it
                tagStack.splice(matchingIndex);
              } else {
                // Push back the popped tag as it wasn't properly closed
                tagStack.push(lastTag);
              }
            }
          }
        }
      }

      // Also run the dedicated orphaned text finder
      findOrphanedTextContent();

      // Check for unclosed tags
      tagStack.forEach((tag) => {
        errors.push({
          message: `Unclosed tag: <${tag.name}>`,
          position: tag.position,
          length: tag.name.length + 2,
        });
      });

      // Check for unquoted or mismatched attribute values
      const attrRegex =
        /<[^>]+\s+([a-zA-Z0-9_:-]+)\s*=\s*([^"'][^\s/>]*|"[^"]*'|'[^']*")/g;

      while ((match = attrRegex.exec(xml)) !== null) {
        if (!isInProtectedSection(match.index)) {
          const attrName = match[1];
          const attrValue = match[2];

          // Check for unquoted values
          if (!/^["']/.test(attrValue)) {
            errors.push({
              message: `Attribute value must be quoted: ${attrName}="${attrValue}"`,
              position: match.index + match[0].indexOf(attrValue),
              length: attrValue.length,
            });
          }
          // Check for mismatched quotes
          else if (
            (attrValue.startsWith('"') && !attrValue.endsWith('"')) ||
            (attrValue.startsWith("'") && !attrValue.endsWith("'"))
          ) {
            errors.push({
              message: `Mismatched quotes in attribute: ${attrName}=${attrValue}`,
              position: match.index + match[0].indexOf(attrValue),
              length: attrValue.length,
            });
          }
        }
      }

      // Check for special characters in content, but only where they're not allowed
      const contentRegex = />([^<]+)</g;

      while ((match = contentRegex.exec(xml)) !== null) {
        const start = match.index + 1;
        const content = match[1];

        // Skip if in protected section
        if (isInProtectedSection(start)) continue;

        // Check for unescaped &
        let ampPos = content.indexOf("&");

        while (ampPos >= 0) {
          // Check if this is a valid entity
          const isEntity = /&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/.test(
            content.substring(ampPos)
          );

          if (!isEntity) {
            errors.push({
              message: `Unescaped special character: & should be &amp;`,
              position: start + ampPos,
              length: 1,
            });
          }
          ampPos = content.indexOf("&", ampPos + 1);
        }

        // Check for < and > but exclude valid cases
        if (content.includes("<")) {
          errors.push({
            message: `Unescaped special character: < should be &lt;`,
            position: start + content.indexOf("<"),
            length: 1,
          });
        }

        // > is generally safe in content but check anyway
        const gtPos = content.indexOf(">");

        if (gtPos >= 0 && !isInProtectedSection(start + gtPos)) {
          // Only flag if it seems problematic
          const nextChars = content.substring(gtPos + 1, gtPos + 4);

          if (nextChars.match(/^[a-zA-Z0-9_]/)) {
            errors.push({
              message: `Possible markup issue: > should be &gt; if it's part of content`,
              position: start + gtPos,
              length: 1,
            });
          }
        }
      }
    } catch (e) {
      // If the validation process itself fails, return a generic error
      errors.push({
        message:
          "XML validation error: " +
          (e instanceof Error ? e.message : String(e)),
        position: 0,
      });
    }

    return errors;
  };

  const formatJson = () => {
    if (language === CodeLanguage.JSON && editorViewRef.current) {
      try {
        const doc = editorViewRef.current.state.doc.toString();

        if (doc.trim()) {
          const formatted = JSON.stringify(JSON.parse(doc), null, 2);
          const transaction = editorViewRef.current.state.update({
            changes: {
              from: 0,
              to: editorViewRef.current.state.doc.length,
              insert: formatted,
            },
          });

          editorViewRef.current.dispatch(transaction);
        }
      } catch (e) {
        // Ignore formatting errors
        throw e;
      }
    }
  };

  const formatXml = () => {
    if (language === CodeLanguage.XML && editorViewRef.current) {
      try {
        const doc = editorViewRef.current.state.doc.toString();

        if (doc.trim()) {
          const formatted = formatXmlString(doc);
          const transaction = editorViewRef.current.state.update({
            changes: {
              from: 0,
              to: editorViewRef.current.state.doc.length,
              insert: formatted,
            },
          });

          editorViewRef.current.dispatch(transaction);
        }
      } catch (e) {
        // Ignore formatting errors
        throw e;
      }
    }
  };

  // Enhanced function to format XML
  const formatXmlString = (xml: string): string => {
    // If XML already appears to be formatted well, return it as is
    if (xml.includes("\n") && xml.includes("  ")) {
      // XML already has line breaks and indentation, likely already formatted
      // Clean up any excessive blank lines that might be present
      return cleanupXmlWhitespace(xml);
    }

    // Begin the formatting process for unformatted XML
    let formatted = "";
    let indentLevel = 0;

    // Remove excessive whitespace but preserve structure
    const cleanXml = xml.replace(/>\s+</g, "><").trim();

    // Function to repeat spaces according to indentation level
    const getIndent = (level: number) => "  ".repeat(level);

    // Split the XML into tags and text nodes
    const parts = cleanXml.split(/(<[^>]+>)/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!part) continue; // Skip empty parts

      if (part.startsWith("</")) {
        // Closing tag - decrease indent and add on its own line
        indentLevel--;
        if (indentLevel < 0) indentLevel = 0; // Safety check
        formatted += "\n" + getIndent(indentLevel) + part;
      } else if (
        part.startsWith("<") &&
        !part.startsWith("<?") &&
        !part.startsWith("<!")
      ) {
        // Opening tag (not processing instruction or declaration)
        const isSelfClosing = part.endsWith("/>");

        // Add tag with proper indentation
        formatted += "\n" + getIndent(indentLevel) + part;

        // Increase indent for non-self-closing tags
        if (!isSelfClosing) {
          indentLevel++;
        }
      } else if (part.trim()) {
        // Text content (non-empty)
        formatted += part;
      }
    }

    // Clean up the formatted XML
    return cleanupXmlWhitespace(formatted.substring(1));
  };

  // Helper function to clean up whitespace in XML
  const cleanupXmlWhitespace = (xml: string): string => {
    // Split into lines for easier processing
    const lines = xml.split("\n");
    const cleanLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines or lines with only whitespace
      if (!line.trim()) continue;

      cleanLines.push(line);
    }

    // Join back with newlines
    return cleanLines.join("\n");
  };

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();

          // Solo para cambios realizados por el usuario (no cambios programáticos)
          if (
            update.transactions.some(
              (tr) => tr.isUserEvent("input") || tr.isUserEvent("delete")
            )
          ) {
            // Evita que la siguiente actualización externa sobrescriba este cambio
            if (isControlled) {
              ignoreNextExternalUpdate.current = true;
            }

            // Notifica al padre sobre el cambio
            onChange(newValue);
          }
        }
      }),
    ];

    if (language === CodeLanguage.JSON) {
      extensions.push(json());
      extensions.push(jsonLinter);
    } else if (language === CodeLanguage.XML) {
      extensions.push(xml());
      extensions.push(xmlLinter);
    }

    extensions.push(
      EditorView.theme({
        "&": {
          fontSize: "12px",
          border: "none",
          height: "100%",
          maxHeight: "100%",
        },
        "&.cm-focused": {
          outline: "none",
        },
        ".cm-gutters": {
          backgroundColor: "#f9fafb",
          border: "none",
          borderRight: "1px solid #e5e7eb",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#f1f5f9",
        },
        ".cm-content": {
          padding: "8px",
        },
        ".cm-line": {
          padding: "0 4px",
        },
        ".cm-gutterElement": {
          padding: "0 8px 0 4px",
        },
        ".cm-diagnostic-error": {
          borderBottom: "2px wavy #ef4444",
        },
        ".cm-diagnostic": {
          padding: "0 4px",
          backgroundColor: "#fee2e2",
        },
      })
    );

    const state = EditorState.create({
      doc: initialValue,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language]);

  // Actualiza el editor cuando cambia el valor externo (solo en modo controlado)
  useEffect(() => {
    if (!isControlled || !editorViewRef.current || value === undefined) return;

    // Si debemos ignorar esta actualización externa, reseteamos la bandera y salimos
    if (ignoreNextExternalUpdate.current) {
      ignoreNextExternalUpdate.current = false;

      return;
    }

    // Obtener el valor actual del editor
    const currentValue = editorViewRef.current.state.doc.toString();

    // Solo actualizar si realmente cambió el valor
    if (currentValue !== value) {
      // Guarda el estado actual de foco y selección
      const hasFocus = document.activeElement === editorViewRef.current.dom;
      const selection = editorViewRef.current.state.selection;

      // Crea y aplica una transacción para actualizar el contenido
      const transaction = editorViewRef.current.state.update({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
        // Preserva la selección actual si es posible
        selection: selection.ranges.some((r) => r.from > value.length)
          ? undefined
          : selection,
      });

      editorViewRef.current.dispatch(transaction);

      // Restaura el foco si el editor lo tenía
      if (hasFocus && editorViewRef.current) {
        editorViewRef.current.focus();
      }
    }
  }, [isControlled, value]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (editorViewRef.current) {
        editorViewRef.current.requestMeasure();
      }
    });

    containerRef.current.addEventListener("mouseup", handleResize);

    resizeObserver.observe(containerRef.current);

    return () => {
      containerRef.current?.removeEventListener("mouseup", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Card
      className="space-y-3 p-3 bg-content1/10 border border-divider"
      shadow="none"
    >
      <div className="flex justify-between items-center">
        <h6 className="text-xs font-medium">
          {language === CodeLanguage.JSON
            ? "JSON"
            : language === CodeLanguage.XML
              ? "XML"
              : "TEXT"}
          {hasError && (
            <span className="ml-2 text-xs text-red-600 font-medium">
              Syntax error
            </span>
          )}
        </h6>

        <div className="flex gap-1">
          {(language === CodeLanguage.JSON ||
            language === CodeLanguage.XML) && (
            <Button
              size="sm"
              variant="flat"
              onClick={language === CodeLanguage.JSON ? formatJson : formatXml}
            >
              Format
            </Button>
          )}
          <Button size="sm" variant="flat" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" variant="flat" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>

      <Card
        ref={containerRef}
        className={`border rounded-md overflow-hidden relative group ${
          hasError ? "border-danger" : "border-divider"
        }`}
        shadow="none"
        style={{
          height: "240px",
          minHeight: "120px",
          maxHeight: "800px",
          borderRadius: "14px",
          resize: "vertical",
        }}
      >
        <div ref={editorRef} className="h-full" />
      </Card>
      <h6 className="text-xs text-foreground/50 flex justify-end">
        You can resize the editor by dragging from the bottom
      </h6>
    </Card>
  );
};
