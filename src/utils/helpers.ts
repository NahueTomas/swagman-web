// TODO: Redoc file

export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export const isObject = (item: unknown): item is Record<string, unknown> =>
  item !== null && typeof item === "object";

export const isNumeric = (n: unknown): n is number =>
  !isNaN(parseFloat(n as string)) && isFinite(n as number);

export const escapeUrl = (url: string) => {
  return url.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F");
};

export const unescapeUrl = (url: string) => {
  return url.replace(/%20/g, " ").replace(/%2F/g, "/").replace(/%3F/g, "?");
};
