import { CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export function RoleCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg ${
        selected
          ? 'border-green-600 bg-green-50 shadow-md ring-4 ring-green-100'
          : 'border-ink-200 bg-white hover:border-green-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`grid h-12 w-12 place-items-center rounded-xl ${selected ? 'bg-green-600' : 'bg-ink-100'}`}>
            <Icon className={`h-6 w-6 ${selected ? 'text-white' : 'text-ink-700'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink-950">{title}</h3>
            <p className="mt-1 text-sm text-ink-600">{description}</p>
          </div>
        </div>
        {selected && <CheckCircle className="h-6 w-6 text-green-600" />}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </button>
  );
}
