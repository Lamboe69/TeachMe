/** Resolve a public-folder asset against Vite's configured base path. */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
}
