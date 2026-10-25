# Tutor UG — Frontend

React + TypeScript + Vite frontend for **Tutor UG**, a peer-to-peer learning platform
where students help other students. In Tutor UG, any student can be a tutor if they have
mastered a subject, and any student can find help from fellow students who have been
through the same exams.

The app connects students seeking assistance with fellow student tutors who can explain
topics the right way. The app talks to a Spring Boot / PostgreSQL REST API, and ships
with an explicit **demo mode** that runs the entire product against in-browser sample
data, so the UI can be reviewed without a running backend.

---

## Quick start

The app runs against **in-browser sample data by default** — no backend needed:

```bash
npm install
npm run dev               # http://localhost:5173  (demo data, out of the box)
```

Switch to the real Spring Boot API once it is ready (no code changes):

```bash
VITE_DEMO_MODE=false npm run dev
```

Demo mode is a build-time flag, so a production demo build is made with:

```bash
VITE_DEMO_MODE=true npm run build
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server on port 5173 with HMR              |
| `npm run build`     | Type-check (`tsc -b`) then production build    |
| `npm run preview`   | Serve the production build locally            |
| `npm run typecheck` | Type-check only                               |
| `npm run lint`      | oxlint                                        |

---

## Environment variables

All variables live in `.env` (see `.env.example`).

| Variable                        | Default                 | Purpose                                                                 |
| ------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `VITE_API_BASE_URL`             | `http://localhost:8080` | Base URL of the Spring Boot API, no trailing slash                      |
| `VITE_API_TIMEOUT`              | `20000`                 | Request timeout in milliseconds                                         |
| `VITE_AUTH_MODE`                | `cookie`                | `cookie` (HttpOnly cookie) or `bearer` (token in the login response)    |
| `VITE_DEMO_MODE`                | `false`                 | Run against the in-browser mock services instead of the real API         |
| `VITE_PASSWORD_RESET_ENABLED`   | `false`                 | Enable the reset-request flow **once the backend implements it**        |

> `VITE_PASSWORD_RESET_ENABLED` stays `false` on purpose: the reset endpoint is not part
> of the agreed MVP contract, so the app says plainly that password reset is not
> available yet instead of pretending an email was sent.

---

## Authentication

Two strategies are supported, selected with `VITE_AUTH_MODE`.

**`cookie` (default, recommended)**

- The backend sets an `HttpOnly`, `Secure`, `SameSite` cookie.
- The client never reads the cookie; it only sends credentials with every request
  (`withCredentials`) and re-establishes the session with `GET /api/auth/me` on load.
- Requires the API to allow the frontend origin with `Access-Control-Allow-Credentials`.

**`bearer`**

- The backend returns a token in the login response body.
- The token is kept in memory and mirrored to `sessionStorage` (tab-scoped) so a refresh
  keeps the user signed in.
- Passwords and long-lived secrets are never written to `localStorage`.

---

## API contract

Every backend path is centralised in
[`src/services/api/endpoints.ts`](src/services/api/endpoints.ts). If the Spring Boot
team exposes different paths, change that file only — no component or service body
needs to be touched.

| Area      | Method | Path                       | Purpose                                  |
| --------- | ------ | -------------------------- | ---------------------------------------- |
| Auth      | POST   | `/api/auth/register`       | Create an account, returns a session     |
| Auth      | POST   | `/api/auth/login`          | Sign in                                  |
| Auth      | GET    | `/api/auth/me`             | Restore the current session              |
| Auth      | POST   | `/api/auth/logout`         | End the session                          |
| Tutors    | GET    | `/api/tutors`              | Paged tutor directory (filter/sort/page) |
| Tutors    | GET    | `/api/tutors/{id}`         | Tutor profile                            |
| Tutors    | GET    | `/api/tutors/{id}/reviews` | Reviews for a tutor                      |
| Tutors    | GET    | `/api/tutors/subjects`     | Subject list for filters                 |
| Sessions  | GET    | `/api/sessions/my`         | Sessions for the signed-in user          |
| Sessions  | POST   | `/api/sessions`            | Request a lesson (student)               |
| Sessions  | GET    | `/api/sessions/{id}`       | Session detail                           |
| Sessions  | PATCH  | `/api/sessions/{id}/status`| Accept / reject / complete / cancel      |
| Sessions  | POST   | `/api/sessions/{id}/reviews` | Leave a review                          |
| Users     | GET    | `/api/users/me`            | Current profile                          |
| Users     | PUT    | `/api/users/me`            | Update the current profile               |

### Expected shapes

The mappers in [`src/services/api/mappers.ts`](src/services/api/mappers.ts) are
deliberately tolerant, so small naming differences between the frontend and the
backend do not break the UI:

- DTO fields are accepted in `camelCase` **or** `snake_case`.
- Tutor and user objects are accepted nested (`user.roles[0]`) or flat (`userRole`).
- Paged lists are accepted as a Spring `Page` (`{ content, totalElements }`) or as a
  bare array.
- Unknown session statuses collapse to `UNKNOWN` instead of breaking the badge.

### Session statuses

`REQUESTED → ACCEPTED → COMPLETED`, with `CANCELLED` and `REJECTED` as terminal
outcomes. The backend remains the authority on what a status transition means; the
frontend only hides actions that are certainly invalid.

---

## Routes

| Path                     | Access        | Page                    |
| ------------------------ | ------------- | ----------------------- |
| `/`                      | public        | Landing                 |
| `/tutors`                | public        | Tutor directory         |
| `/tutors/:id`            | public        | Tutor profile           |
| `/login`                 | guests only   | Sign in                 |
| `/register`              | guests only   | Sign up                 |
| `/forgot-password`       | public        | Password reset          |
| `/student/dashboard`     | students      | Student dashboard       |
| `/student/profile`       | students      | Student profile         |
| `/tutor/dashboard`       | tutors        | Tutor dashboard         |
| `/tutor/sessions`        | tutors        | Tutor session inbox     |
| `/sessions`              | signed in     | Session list            |
| `/sessions/:id`          | signed in     | Session detail          |
| `/sessions/book/:tutorId`| students      | Book a lesson           |
| `/sessions/:id/feedback` | students      | Leave a review          |
| `/unauthorized`          | signed in     | Access denied           |
| `*`                      | public        | Not found               |

Route guards live in [`src/routes/guards.tsx`](src/routes/guards.tsx). They are a UX
convenience only — the API checks every request.

---

## Demo mode

Set `VITE_DEMO_MODE=true` and the app swaps the live service layer for
[`src/services/demo/`](src/services/demo). Demo data is generated in the browser and
persisted to `sessionStorage`, so a refresh keeps your changes and a new tab starts
fresh.

A banner is always visible at the top of the page, and every demo screen is labelled,
so demo content can never be mistaken for real data.

Demo accounts:

| Role   | Email                  | Password   |
| ------ | ---------------------- | ---------- |
| Student| `mary.demo@tutorug.ug` | `Demo1234` |
| Tutor  | `sarah.demo@tutorug.ug`| `Demo1234` |

---

## Project structure

```
src/
├── app/            # runtime config and the app shell
├── components/     # ui kit, layout, tutor and session components
├── context/        # AuthContext, ToastContext
├── hooks/          # data fetching and shared hooks
├── layouts/        # RootLayout (public) and AuthLayout (sign in / sign up)
├── pages/          # one file per route
├── routes/         # route table and guards
├── services/       # api/ (live) + demo/ (mock) + shared facade
├── styles/         # Tailwind v4 theme and base styles
├── types/          # domain and API types
└── utils/          # formatting, validation, permissions
```

The service facade in [`src/services/index.ts`](src/services/index.ts) is what pages
import. It picks the live or the demo implementation once, at startup, so no page ever
knows which mode it is running in.

---

## Accessibility and responsiveness

- Semantic landmarks, a skip-to-content link and labelled sections throughout.
- Visible focus rings, keyboard-operable menus and dialogs, and `aria-live` toasts.
- Layouts are mobile-first and tested from 320 px up; no horizontal scrolling.
- Colours meet WCAG AA contrast, and status is never conveyed by colour alone.
- `prefers-reduced-motion` is respected.

## Performance

Every page is loaded on demand (`React.lazy` + `Suspense`), so a visitor who only opens the
landing page never downloads the booking, feedback or dashboard code. The production build
splits into a ~103 kB gzipped shell plus small per-page chunks — which matters on the
mobile connections most Ugandan learners use.

## Security notes

  - No secret is ever bundled into the client; only `VITE_`-prefixed public settings are.
  - Passwords are validated with Zod in the browser and are never stored.
  - The token, when using bearer mode, lives in memory and `sessionStorage` only.
  - The backend is the authority on permissions; the UI never treats a hidden button as
    a security control.

---

## Testing

The project has two test layers:

| Layer        | Tool            | What it covers                                       |
| ------------ | --------------- | ---------------------------------------------------- |
| Unit         | `vitest` + jsdom | Pure-logic modules: formatting, schemas, permissions |
| End-to-end   | `Playwright`    | Full user flows against a running dev server        |

### Unit tests

```bash
npm run test:unit        # run once, then exit
npm run test:unit -- --watch   # watch mode
```

### End-to-end tests

The E2E suite runs the app in demo mode against a real browser. It starts the dev server
for you, so a single command is enough:

```bash
npm run test:e2e
```

To run against a server you started yourself (e.g. a production build):

```bash
BASE_URL=http://localhost:4173 npm run test:e2e
```

The suite exercises every public route plus the full authenticated flow:

- register → login → tutor directory → profile → book a session
- tutor login → accept a pending request
- session detail view
- 404 and unauthorized pages
- mobile layout (no horizontal overflow)

### Acceptance checklist

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — succeeds in both demo and real modes
- `npm run test:unit` — all unit tests pass
- `npm run test:e2e` — all E2E tests pass
