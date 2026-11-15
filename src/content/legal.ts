import { PLATFORM_FEE_PERCENT } from '@/app/config';

/**
 * Plain-language policy content shown on the public legal pages.
 *
 * These are product summaries, not legal advice. Have them reviewed by a
 * qualified person before relying on them.
 */

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}

export type LegalSlug = 'terms' | 'privacy' | 'refunds';

export const SUPPORT_EMAIL = 'support@tutorug.ug';

export const LEGAL_DOCUMENTS: Record<LegalSlug, LegalDocument> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    summary:
      'The rules for using TutorUG — what you can expect from us, and what we expect from you.',
    updated: '15 November 2026',
    sections: [
      {
        heading: '1. Who we are',
        paragraphs: [
          'TutorUG is a peer-to-peer tutoring marketplace that connects university students in Uganda who want to learn with fellow students who are willing to teach. TutorUG provides the platform, the payment rails and the escrow service; we are not the tutor and we do not deliver the lessons.',
        ],
      },
      {
        heading: '2. Your account',
        bullets: [
          'You must be at least 18 years old, or have permission from a parent or guardian.',
          'You must provide accurate information and keep your password private.',
          'You are responsible for everything that happens under your account.',
          'One person, one account. You may not share or sell your account.',
        ],
      },
      {
        heading: '3. Student responsibilities',
        bullets: [
          'Book sessions honestly and attend the sessions you request.',
          'Keep your wallet funded so booked sessions can be paid for.',
          'Treat tutors with respect and keep communication on the platform.',
          'Leave fair, truthful reviews only for sessions that actually took place.',
        ],
      },
      {
        heading: '4. Tutor responsibilities',
        bullets: [
          'Only offer to teach course units you genuinely understand and have studied.',
          'Set an honest rate and honour the sessions you accept.',
          'Show up on time and deliver the help you advertised.',
          `Understand that TutorUG keeps a ${PLATFORM_FEE_PERCENT}% service fee from your earnings on each completed session.`,
        ],
      },
      {
        heading: '5. Payments and escrow',
        paragraphs: [
          'Sessions are paid for from your TutorUG wallet. When you book a session, the session fee is moved into escrow and held by TutorUG. Funds are released to the tutor, minus the service fee, only after the session is marked complete and confirmed.',
          'You top up and withdraw your wallet using MTN MoMo or Airtel Money. TutorUG does not store your mobile-money PIN.',
        ],
      },
      {
        heading: '6. Cancellations and refunds',
        paragraphs: [
          'If a tutor declines a booking request, or either party cancels before the session is completed, the escrowed amount is refunded to the student in full. Full details are in our Refund & Cancellation Policy.',
        ],
      },
      {
        heading: '7. Acceptable use',
        bullets: [
          'Do not use TutorUG to harass, discriminate against or defraud anyone.',
          'Do not attempt to take payments off the platform to avoid the service fee.',
          'Do not upload unlawful content or misuse another person\u2019s data.',
          'We may suspend or close accounts that break these rules.',
        ],
      },
      {
        heading: '8. Disclaimers and liability',
        paragraphs: [
          'TutorUG is provided "as is". While we work to keep the platform safe and reliable, we cannot guarantee any particular academic result, and we are not responsible for the conduct of any user. To the extent permitted by law, our liability is limited to the amount held in escrow for the session concerned.',
        ],
      },
      {
        heading: '9. Changes to these terms',
        paragraphs: [
          'We may update these terms as the product evolves. We will change the "last updated" date above and, where the change is significant, tell you in the app.',
        ],
      },
      {
        heading: '10. Contact',
        paragraphs: [`Questions about these terms? Email ${SUPPORT_EMAIL}.`],
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary: 'What personal information TutorUG collects, why we collect it, and how we protect it.',
    updated: '15 November 2026',
    sections: [
      {
        heading: '1. Information we collect',
        bullets: [
          'Account details: your name, email address, password (stored hashed) and role.',
          'Profile details: your bio, phone number, subjects, rate, location and availability.',
          'Activity: sessions booked, messages sent within a session, reviews and wallet transactions.',
          'Technical data: basic device and log information used to keep the service secure.',
        ],
      },
      {
        heading: '2. How we use your information',
        bullets: [
          'To create your account and let you sign in.',
          'To match students with tutors and run the booking, escrow and review features.',
          'To send you service messages about your sessions, wallet and account.',
          'To keep the platform safe, prevent fraud and comply with the law.',
        ],
      },
      {
        heading: '3. What other users can see',
        paragraphs: [
          'When you book a session, the tutor sees your name, your booking message and the session details. Tutors also see the contact details you choose to share for that session. Your email address is never shown publicly.',
        ],
      },
      {
        heading: '4. Sharing with third parties',
        paragraphs: [
          'We share the minimum necessary information with our mobile-money providers (MTN and Airtel) to process top-ups and withdrawals, and with infrastructure providers who host the service on our behalf. We do not sell your personal data.',
        ],
      },
      {
        heading: '5. Keeping your data safe',
        paragraphs: [
          'Passwords are hashed and never stored in plain text. Access to personal data is limited to what each feature needs. No system is perfectly secure, so please use a strong, unique password.',
        ],
      },
      {
        heading: '6. Your choices',
        bullets: [
          'You can edit your profile information at any time.',
          'You can ask us to delete your account by emailing support.',
          'You can choose what contact details to share with a tutor.',
        ],
      },
      {
        heading: '7. Contact',
        paragraphs: [`For any privacy request, email ${SUPPORT_EMAIL}.`],
      },
    ],
  },

  refunds: {
    slug: 'refunds',
    title: 'Refund & Cancellation Policy',
    summary: 'How escrow, cancellations and refunds work on TutorUG.',
    updated: '15 November 2026',
    sections: [
      {
        heading: '1. Your money is held in escrow',
        paragraphs: [
          'When you book a session, the session fee leaves your wallet and is held in escrow by TutorUG. The tutor does not receive the money yet. This protects both sides: the tutor knows the money is committed, and the student knows it is only released once the session is done.',
        ],
      },
      {
        heading: '2. If a tutor declines',
        paragraphs: [
          'A booking is a request. If the tutor declines it, the escrowed amount is refunded to your wallet in full and immediately.',
        ],
      },
      {
        heading: '3. If either party cancels',
        paragraphs: [
          'Before a session is completed, either the student or the tutor can cancel. When that happens, the full escrowed amount is returned to the student\u2019s wallet. There is currently no late-cancellation fee.',
        ],
      },
      {
        heading: '4. When the tutor is paid',
        paragraphs: [
          `Once the session is complete and both parties confirm, the escrowed amount is released to the tutor, minus the ${PLATFORM_FEE_PERCENT}% TutorUG service fee. The tutor can then withdraw their earnings to MTN MoMo or Airtel Money.`,
        ],
      },
      {
        heading: '5. If something goes wrong',
        paragraphs: [
          `If a session did not happen as agreed, or you believe a payment was made in error, do not confirm the session. Contact us at ${SUPPORT_EMAIL} with your session details and we will investigate before any money is released.`,
        ],
      },
      {
        heading: '6. Wallet top-ups',
        paragraphs: [
          'Mobile-money top-ups are processed by MTN and Airtel. If a top-up fails but money left your mobile-money account, it is returned by the provider according to their own timelines. Contact support if a top-up does not appear.',
        ],
      },
    ],
  },
};
