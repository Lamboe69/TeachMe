import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LEGAL_DOCUMENTS, SUPPORT_EMAIL } from '@/content/legal';
import type { LegalSlug } from '@/content/legal';

const RELATED: { slug: LegalSlug; label: string; to: string }[] = [
  { slug: 'terms', label: 'Terms of Service', to: '/terms' },
  { slug: 'privacy', label: 'Privacy Policy', to: '/privacy' },
  { slug: 'refunds', label: 'Refund & Cancellation', to: '/refund-policy' },
];

export function LegalPage({ doc }: { doc: LegalSlug }) {
  const document = LEGAL_DOCUMENTS[doc];

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-[#D4FF24]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(21,88,201,0.2)] text-[#D4FF24]">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {document.title}
            </h1>
            <p className="mt-2 text-white/60">{document.summary}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/40">
              Last updated {document.updated}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {RELATED.map((item) => (
            <Link
              key={item.slug}
              to={item.to}
              className={
                item.slug === doc
                  ? 'rounded-full bg-[#D4FF24] px-4 py-1.5 text-xs font-bold text-[#030407]'
                  : 'rounded-full border border-[rgba(21,88,201,0.4)] px-4 py-1.5 text-xs font-bold text-white/60 transition hover:border-[#D4FF24] hover:text-white'
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Card className="mt-6 p-6 sm:p-8">
          <div className="flex flex-col gap-8">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-bold text-white">{section.heading}</h2>
                {section.paragraphs?.map((paragraph, i) => (
                  <p key={i} className="mt-3 text-sm leading-relaxed text-white/60">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/60">
                        <ShieldCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#D4FF24]"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </Card>

        <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm text-white/60">Still have a question about this policy?</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D4FF24] px-4 py-2.5 text-sm font-bold text-[#030407] transition hover:opacity-90"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact support
          </a>
        </Card>
      </div>
    </div>
  );
}
