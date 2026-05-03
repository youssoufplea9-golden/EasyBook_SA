/**
 * Utility to merge Tailwind class names.
 * Lightweight drop-in — no extra dependencies needed.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
