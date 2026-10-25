import { useId } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

/**
 * Accessible tab strip. Uses `role="tablist"` with arrow-key navigation and
 * an overflow-safe horizontal scroll container on small screens.
 */
export function Tabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const baseId = useId();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.value === value);
    if (index === -1) return;

    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;

    event.preventDefault();
    onChange(items[next].value);
    const target = document.getElementById(`${baseId}-${items[next].value}`);
    target?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-ink-200 px-1',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            id={`${baseId}-${item.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${baseId}-${item.value}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-semibold transition',
              selected
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700',
            )}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'ml-2 rounded-full px-1.5 py-0.5 text-xs font-bold',
                  selected ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-600',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  if (!active) return null;
  return (
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}`} tabIndex={0} className="pt-5">
      {children}
    </div>
  );
}
