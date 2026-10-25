import { FlaskConical } from 'lucide-react';
import { isDemoMode } from '@/services';

/**
 * Persistent, unmistakable label that the app is running against mock data.
 * Shown on every page so demo content is never mistaken for live records.
 */
export function DemoBanner({ className }: { className?: string }) {
  if (!isDemoMode) return null;

  return (
    <div
      className={`border-b border-amber-200 bg-amber-50 ${className}`}
      role="status"
      aria-label="Demo mode notice"
    >
      <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-xs font-medium text-amber-900 sm:text-sm">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-bold">Demo mode</strong> — showing sample data. Nothing here is
          saved to the Tutor UG database.
        </span>
      </div>
    </div>
  );
}
