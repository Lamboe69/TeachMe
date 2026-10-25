export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

const FONT_SIZES = new Set([
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
]);

const TEXT_ALIGNMENTS = new Set(['left', 'center', 'right', 'justify', 'start', 'end']);

const BORDER_WIDTHS = new Set(['0', '2', '4', '8', 'x', 'y', 't', 'b', 'l', 'r']);

const BORDER_STYLES = new Set(['solid', 'dashed', 'dotted', 'double', 'none', 'hidden']);

const BORDER_RADII = new Set([
  'none',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  'full',
]);

/**
 * Groups that are unambiguous enough to resolve as "last one wins".
 * Only colour / radius / shadow style utilities are included so that
 * legitimate combinations such as `px-4 py-3` are never collapsed.
 */
function conflictKey(cls: string): string | null {
  const variantMatch = cls.match(/^((?:[a-z-]+:)*)(.*)$/);
  if (!variantMatch) return null;
  const prefix = variantMatch[1] ?? '';
  const base = variantMatch[2] ?? '';

  if (base.startsWith('bg-')) return `${prefix}bg`;
  if (base.startsWith('shadow-')) return `${prefix}shadow`;
  if (base.startsWith('rounded-')) return `${prefix}rounded`;
  if (base.startsWith('ring-')) return `${prefix}ring`;
  if (base.startsWith('border-')) {
    const suffix = base.slice('border-'.length);
    if (BORDER_WIDTHS.has(suffix)) return `${prefix}border-w`;
    if (BORDER_STYLES.has(suffix)) return `${prefix}border-style`;
    if (BORDER_RADII.has(suffix)) return `${prefix}border-radius`;
    return `${prefix}border-color`;
  }
  if (base.startsWith('text-')) {
    const suffix = base.slice('text-'.length);
    if (FONT_SIZES.has(suffix)) return `${prefix}text-size`;
    if (TEXT_ALIGNMENTS.has(suffix)) return `${prefix}text-align`;
    return `${prefix}text-color`;
  }
  return null;
}

function flatten(value: ClassValue, out: string[]): void {
  if (!value && value !== 0) return;
  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => flatten(item, out));
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, enabled]) => {
      if (enabled) out.push(key);
    });
  }
}

/**
 * Minimal class-name combiner.
 *
 * Strings are joined in order; utilities that share a conflicting property
 * (background colour, text colour, radius, shadow, ring) resolve to the last
 * one supplied. Layout utilities are never collapsed.
 */
export function cn(...inputs: ClassValue[]): string {
  const raw: string[] = [];
  flatten(inputs, raw);

  const resolved = new Map<string, string>();
  const order: string[] = [];

  raw.forEach((token) => {
    for (const cls of token.split(/\s+/).filter(Boolean)) {
      const key = conflictKey(cls);
      if (!key) {
        const rawKey = `__raw__${cls}`;
        if (!resolved.has(rawKey)) order.push(rawKey);
        resolved.set(rawKey, cls);
        continue;
      }
      if (!resolved.has(key)) order.push(key);
      resolved.set(key, cls);
    }
  });

  return order.map((key) => resolved.get(key) ?? '').filter(Boolean).join(' ');
}
