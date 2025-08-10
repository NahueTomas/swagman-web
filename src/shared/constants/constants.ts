export const RESPONSE_PANEL = {
  MIN_HEIGHT: 100,
  DEFAULT_HEIGHT: 300,
  MAX_HEIGHT_RATIO: 0.8,
  COLLAPSED_HEIGHT: 40,
  RESIZE_DEBOUNCE: 16,
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
  XML: "application/xml",
  HTML: "text/html",
  CSS: "text/css",
  JAVASCRIPT: "application/javascript",
  PLAIN_TEXT: "text/plain",
  FORM_DATA: "multipart/form-data",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
} as const;

export const LANGUAGE_MAPPINGS = {
  json: ["json", "application/json"],
  xml: ["xml", "application/xml", "text/xml"],
  html: ["html", "text/html"],
  css: ["css", "text/css"],
  javascript: ["javascript", "application/javascript", "text/javascript"],
  plaintext: ["plain", "text/plain"],
} as const;

export const UI_CONSTANTS = {
  SIDEBAR_DEFAULT_WIDTH: 256,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
} as const;

export const HTTP_STATUS_RANGES = {
  SUCCESS: { min: 200, max: 299 },
  REDIRECT: { min: 300, max: 399 },
  CLIENT_ERROR: { min: 400, max: 499 },
  SERVER_ERROR: { min: 500, max: 599 },
} as const;

export const KEYFRAMES = {
  LOADING_WAVE: `
    @keyframes loading-wave {
      0% {
        transform: translateX(-100%);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      80% {
        opacity: 1;
      }
      100% {
        transform: translateX(233%);
        opacity: 0;
      }
    }
  `,
} as const;
