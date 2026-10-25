import { Link } from 'react-router-dom';
import { BookOpen, MapPin } from 'lucide-react';
import type { TutorSummary } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { formatRate } from '@/utils/format';

export function TutorCard({ tutor }: { tutor: TutorSummary }) {
  return (
    <article
      data-testid="tutor-card"
      className="flex h-full min-w-0 flex-col rounded-card border border-ink-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-4">
        <Avatar name={tutor.fullName} src={tutor.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink-900">
            <Link to={`/tutors/${tutor.id}`} className="hover:text-brand-700">
              {tutor.fullName}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating value={tutor.rating} size="xs" />
            {tutor.reviewCount > 0 ? (
              <span className="text-xs text-ink-500">
                {tutor.reviewCount} review{tutor.reviewCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
          {tutor.location ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {tutor.location}
            </p>
          ) : null}
        </div>
      </div>

      {tutor.subjects.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Subjects taught">
          {tutor.subjects.slice(0, 4).map((subject) => (
            <li key={subject}>
              <Badge tone="brand">{subject}</Badge>
            </li>
          ))}
          {tutor.subjects.length > 4 ? (
            <li>
              <Badge tone="neutral">+{tutor.subjects.length - 4} more</Badge>
            </li>
          ) : null}
        </ul>
      ) : null}

      {tutor.bio ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{tutor.bio}</p>
      ) : null}

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink-100 pt-4">
        <div>
          <p className="text-sm font-bold text-ink-900">{formatRate(tutor.hourlyRate)}</p>
          {tutor.sessionCount > 0 ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {tutor.sessionCount} sessions
            </p>
          ) : null}
        </div>
        <Link
          to={`/tutors/${tutor.id}`}
          className="inline-flex h-9 shrink-0 items-center rounded-lg border border-brand-200 px-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
