/**
 * Simple memoization utility for caching function results
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  cacheSize = 100
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();

  return (...args: TArgs): TReturn => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    // Prevent cache from growing too large
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;

      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);

    return result;
  };
}
