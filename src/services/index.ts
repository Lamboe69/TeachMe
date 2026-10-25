import { DEMO_MODE } from '@/app/config';
import type { Services } from './types';

import * as realAuth from './api/auth.service';
import * as realReviews from './api/reviews.service';
import * as realSessions from './api/sessions.service';
import * as realTutors from './api/tutors.service';
import * as realUsers from './api/users.service';
import * as realWallet from './api/wallet.service';

import * as demoAuth from './demo/auth.service';
import * as demoReviews from './demo/reviews.service';
import * as demoSessions from './demo/sessions.service';
import * as demoTutors from './demo/tutors.service';
import * as demoUsers from './demo/users.service';
import * as demoWallet from './demo/wallet.service';

/**
 * The single entry point the UI talks to.
 *
 * In demo mode the mock services are used and every screen shows a demo
 * banner so nobody mistakes sample data for real database records. Turning
 * `VITE_DEMO_MODE` off swaps in the live Spring Boot services — no component
 * changes are required.
 */

const liveServices: Services = {
  auth: realAuth,
  tutors: realTutors,
  sessions: realSessions,
  reviews: realReviews,
  users: realUsers,
  wallet: realWallet,
};

const demoServices: Services = {
  auth: demoAuth,
  tutors: demoTutors,
  sessions: demoSessions,
  reviews: demoReviews,
  users: demoUsers,
  wallet: demoWallet,
};

export const services: Services = DEMO_MODE ? demoServices : liveServices;

export const isDemoMode = DEMO_MODE;

export type { Services };
