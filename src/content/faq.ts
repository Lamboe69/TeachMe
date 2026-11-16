import { PLATFORM_FEE_PERCENT } from '@/app/config';

/**
 * Shared help content.
 *
 * Kept in one place so the marketing site, the in-app help page and any
 * future surface never drift apart — the same words, learned once.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'How much does TutorUG cost?',
    a: `Joining is free for everyone. Students pay only for the sessions they book, at the rate their tutor sets — most sessions cost UGX 2,000–20,000. You can also agree a single price for a whole course unit or a full semester. Tutors keep their earnings minus a ${PLATFORM_FEE_PERCENT}% TutorUG service fee on completed sessions.`,
  },
  {
    q: 'How do payments work?',
    a: 'You top up your TutorUG wallet using MTN MoMo or Airtel Money. When you book a session, the fee moves from your wallet into escrow — held by TutorUG, not by the tutor — and is only released once the session is done and confirmed.',
  },
  {
    q: 'What if the session never happens?',
    a: 'If a tutor declines your request, or either side cancels before the session is completed, the full escrowed amount is refunded to your wallet. See our Refund & Cancellation Policy for details.',
  },
  {
    q: 'How do tutors get paid?',
    a: `After a session is completed and both sides confirm, the escrowed amount is released to the tutor minus the ${PLATFORM_FEE_PERCENT}% service fee. Tutors can then withdraw their earnings to MTN MoMo or Airtel Money.`,
  },
  {
    q: 'How do I know a tutor is any good?',
    a: 'Every tutor profile shows the subjects they teach, their experience, how many sessions they have taught, their rate, their weekly availability and reviews left by other students.',
  },
  {
    q: 'Are sessions online or in person?',
    a: 'You agree the details with your tutor. Use the session chat to decide how and where you will meet, and message each other before the session.',
  },
  {
    q: 'Who can join TutorUG?',
    a: 'TutorUG is built for university students in Uganda. You must be at least 18, or have permission from a parent or guardian, and you must provide accurate details.',
  },
  {
    q: 'How do I become a tutor?',
    a: 'Create an account and choose "Become a tutor", then set the course units you teach, your rate and your weekly availability. You can start receiving booking requests right away.',
  },
  {
    q: 'Something went wrong with a session. What do I do?',
    a: 'Do not confirm the session if it did not happen as agreed. Contact support with your session details and we will look into it before any money is released.',
  },
];

export interface HowItWorksStep {
  num: string;
  title: string;
  desc: string;
}

/** The four-step mental model of the product, reused everywhere. */
export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    num: '01',
    title: 'Find a tutor',
    desc: 'Browse fellow students by course unit, compare their rate, reviews and availability.',
  },
  {
    num: '02',
    title: 'Book & pay into escrow',
    desc: 'Pick a time and send a request. The fee leaves your wallet and is held by TutorUG — not the tutor.',
  },
  {
    num: '03',
    title: 'Tutor accepts',
    desc: 'Your tutor confirms the request. If they decline, the full amount is refunded to your wallet.',
  },
  {
    num: '04',
    title: 'Learn, confirm & review',
    desc: 'Have your session, then both sides confirm completion. The tutor gets paid and you leave a review.',
  },
];

/** Plain-language glossary so the vocabulary is learned once. */
export const GLOSSARY: FaqItem[] = [
  { q: 'Session', a: 'A single tutoring meeting you book with a tutor — usually one hour.' },
  { q: 'Course unit', a: 'A module you study, e.g. MAT 1201. You can book one session or agree a price for a whole unit.' },
  { q: 'Wallet', a: 'Your TutorUG balance. Top it up with MTN MoMo or Airtel Money, and it pays for sessions.' },
  { q: 'Escrow', a: 'Money held safely by TutorUG after you book, released to the tutor only once the session is completed and confirmed.' },
  { q: 'Confirm', a: 'Both you and your tutor tap confirm after a session so the money can move. Neither side controls it alone.' },
  { q: 'Review', a: 'The star rating and comment you leave for a tutor after a completed session.' },
];
