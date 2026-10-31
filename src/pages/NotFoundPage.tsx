import { Compass, Home, Search } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Card theme="light" className="w-full max-w-xl p-8 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>

        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-brand-600">404 error</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          We could not find that page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
          The link may be broken, or the page may have moved. Try searching for a tutor, or head
          back to the home page.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink theme="light" to="/" leftIcon={Home}>
            Back to home
          </ButtonLink>
          <ButtonLink theme="light" to="/tutors" variant="outline" leftIcon={Search}>
            Browse tutors
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
