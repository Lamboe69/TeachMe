import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import type { SessionStatus } from '@/types';
import { SESSION_STATUS_META } from '@/utils/sessionPermissions';

export function SessionStatusBadge({
  status,
  className,
}: {
  status: SessionStatus;
  className?: string;
}) {
  const meta = SESSION_STATUS_META[status] ?? SESSION_STATUS_META.UNKNOWN;
  const tone: BadgeTone = meta.tone;
  return (
    <Badge tone={tone} className={className}>
      {meta.label}
    </Badge>
  );
}
