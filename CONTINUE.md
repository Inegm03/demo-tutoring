# CONTINUE.md — Handoff guide for any human or AI continuing this project

Read this file top-to-bottom before changing anything. It explains every file,
in the order the project was built, the conventions used, and exactly how to
extend it without breaking the demo.

## 0. What this is

A client-only React SPA that demos an on-demand tutoring marketplace
(think ride-hailing UX applied to tutoring) for Saudi Arabia. Two roles
(student / teacher), bilingual EN + AR (real RTL), SAR currency, simulated
backend in localStorage. The core demo flow MUST always keep working:

> student request → matching → teacher first-accept → session room →
> completion (wallet −35 / earnings +35) → mutual ratings → history.

Run `npm run dev`, sign in with the two demo buttons in two tabs, and verify
that flow after ANY change. `npm run build` must stay green (it type-checks).

## 1. Golden rules (do not break these)

1. **Pages never touch localStorage.** All reads go through `useDB()` /
   selectors, all writes through functions in `src/lib/api.ts`. This is what
   makes a future real backend a drop-in replacement.
2. **Every user-visible string goes through `t('key')`** with an EN and AR
   entry in `src/i18n/translations.ts`. Never hard-code UI text (legal-page
   long-form content is the one deliberate exception).
3. **RTL-safe styling only**: use `start`/`end` Tailwind utilities
   (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`) — never
   `left`/`right` unless direction-independent.
4. **No fake claims** in UI copy: no invented statistics, testimonials,
   verification, or partnerships. Anything simulated is labeled with the
   `DemoTag` component or explicit "(demo)" text.
5. **Brand/business values** come only from `src/config/brand.ts`; pricing
   rules only from `src/config/pricing.ts`.
6. **No secrets, no analytics, no trackers, no new third-party requests**
   without updating the Cookie/Privacy pages to match reality.
7. Seeded people are fictional; keep it that way.

## 2. File map — in build order (what each file does)

### Step 1 — Tooling & config
| File | Purpose |
|---|---|
| `package.json` | Pinned for Node 20.0: Vite 5, React 18, Tailwind 3.4, framer-motion 11, lucide-react, react-router 6. |
| `vite.config.ts` | Vanilla Vite + React plugin. |
| `tsconfig.json` | Strict TS, `target ES2021`, `noUnusedLocals` (build fails on unused vars). |
| `postcss.config.js`, `tailwind.config.js` | Tailwind setup. Design tokens live here: `brand` (teal/jade), `sand` (warm amber), `ink` (neutral text), fonts (Plus Jakarta Sans / IBM Plex Sans Arabic), `shadow-soft/lift`, `pulse-ring` + `shimmer` keyframes. |
| `index.html` | Fonts (Google Fonts), inline SVG favicon, `<div id="root">`, and a small **rAF-when-hidden shim** so background tabs keep animating during the two-tab demo (remove for production). |

### Step 2 — Domain: types, config, data
| File | Purpose |
|---|---|
| `src/lib/types.ts` | All entities: `User`, `StudentProfile`, `TeacherProfile`, `Subject`, `TutoringRequest`, `Session`, `Transaction`, `AppNotification`, `Report`, `DB`. Statuses: request `searching→accepted/cancelled/expired`; session `upcoming→live→completed/cancelled`. |
| `src/config/brand.ts` | Product name + ALL business placeholders (`[Legal Business Name — placeholder]` etc.). Rebrand here. |
| `src/config/pricing.ts` | `sessionPrice(level, duration)` = base/hour × duration multiplier, rounded. Secondary 60 min = **35 SAR** (the demo story depends on this). `PLATFORM_COMMISSION_RATE` (0, configurable), `TOPUP_PRESETS`. |
| `src/lib/subjects.ts` | Saudi-relevant subject catalogue (EN/AR names, lucide icon key, allowed levels), `LEVELS`, `GRADES_BY_LEVEL`. |
| `src/lib/ids.ts` | `uid(prefix)`. |
| `src/lib/seed.ts` | `DB_VERSION` + `buildSeed()`: demo student Sara (100 SAR), demo teacher Ahmed + 4 more fictional teachers, 2 completed sessions, transactions, notifications. **Bump `DB_VERSION` whenever the seed shape changes** — old stored DBs are discarded when version differs. |

### Step 3 — State layer
| File | Purpose |
|---|---|
| `src/lib/db.ts` | The "backend". One JSON doc in `localStorage['demo-tutoring-db']`. `mutate(fn)` re-reads fresh, mutates, writes, notifies. Cross-tab sync via the `storage` event. `useDB()` = `useSyncExternalStore` hook. Per-tab auth in `sessionStorage['demo-tutoring-current-user']` + `useCurrentUserId()` (primitive snapshot — this exists because object-identity snapshots don't re-render on sign-in; don't "simplify" it away). `resetDemoData()`. |
| `src/lib/api.ts` | Simulated async API (400–900 ms latency, `ApiError` codes). Key functions: `signInDemo/signInEmail/register/signOut`, `topUpWallet`, `createRequest` (checks balance), `cancelRequest`, **`acceptRequest` (first-accept compare-and-set: throws `already_taken`)**, `simulateDemoAccept`, `setTeacherOnline`, `openRequestsFor` (online + subject + level filter), `startSession`, `sendChatMessage`, **`completeSession` (idempotent: wallet −price, earnings +net, 2 transactions, notifications)**, `rateSession` (running-average updates), `markNotificationsRead`, `submitReport`. |
| `src/lib/format.ts` | `formatSAR` (ر.س in AR), `formatDate/Time/DateTime`, `timeAgo`, `formatDurationClock`. Always use these. |

### Step 4 — i18n & contexts
| File | Purpose |
|---|---|
| `src/i18n/translations.ts` | `en` object (source of truth for keys, `TKey` type) + `ar` (typed `Record<TKey,string>` so a missing AR key is a compile error). `{param}` interpolation. |
| `src/i18n/LanguageContext.tsx` | `useLang()` → `{ lang, dir, setLang, t }`. Sets `<html lang dir>`. Preference persisted. |
| `src/context/AuthContext.tsx` | `useAuth()` → `{ user }`. Route guards `RequireRole` (redirects wrong role to its own dashboard — this is the client-side route protection) and `RequireAuth`. |
| `src/context/ToastContext.tsx` | `useToast()` → `toast(msg, 'success'|'error'|'info')`. Bottom-center, aria-live. |

### Step 5 — UI system
| File | Purpose |
|---|---|
| `src/components/ui.tsx` | `Logo`, `Button` (variants primary/secondary/outline/ghost/danger, `loading`, `full`), `Avatar` (generated initials + hue gradient — no photos), `Stars` (display) + `StarInput` (radiogroup), `StatusChip`, `DemoTag`, `SubjectIcon` (maps icon key → lucide), `FunIconChip` (wiggle-on-hover icon), `Skeleton`, `EmptyState`, `Field` (label+hint+error wiring), `Modal` (focus trap, Esc, aria-modal). |
| `src/components/AppShell.tsx` | Authed layout: demo banner, top bar (logo, desktop nav, language toggle, notification bell + panel, profile dropdown with support/reset/sign-out), mobile bottom tab bar, demo-reset confirm modal. Nav items differ by role. |
| `src/components/SessionHistoryList.tsx` | Shared filterable history list (student and teacher variants). |
| `src/components/ReportModal.tsx` | Safety reporting (reason + details → `submitReport`). |
| `src/index.css` | Tailwind layers, `.card`, `.input`, `.label`, `.skeleton`, focus-visible outline, reduced-motion override, RTL font swap. |

### Step 6 — Pages (routes in `src/App.tsx`, entry `src/main.tsx`)
| Route | File | Notes |
|---|---|---|
| `/` | `pages/Landing.tsx` | Hero (stylized request card), how-it-works, subjects (interactive chips), student/teacher value props, safety (dark section), FAQ accordion, CTA, footer with legal links + placeholders. Signed-in users are redirected to their dashboard. |
| `/auth/signin` | `pages/auth/SignIn.tsx` | **Demo buttons first** (most important), email form, simulated Google, links. `?demo=teacher` flips button emphasis. |
| `/auth/register` | `pages/auth/Register.tsx` | Role cards → form. Terms checkbox (required, unchecked) separate from marketing (optional, unchecked). Teacher picks subjects. |
| `/auth/forgot` | `pages/auth/Forgot.tsx` | Simulated reset email. |
| `/student` | `pages/student/StudentDashboard.tsx` | Greeting, live status banner (searching/active session), big CTA, wallet card, study-tip card, recent sessions (+ rate button), recent tutors. Skeletons on load. |
| `/student/request` | `pages/student/RequestWizard.tsx` | 3 steps: what (level/grade/subject) → details (topic/desc/attachment-demo/duration with per-duration prices) → review (price, balance-after, cancel policy). Insufficient-balance modal → wallet. |
| `/student/matching/:id` | `pages/student/Matching.tsx` | Radar animation, request summary, cancel confirm, demo tip (after 6 s: open teacher tab OR simulate button), reacts live to acceptance → teacher card + Enter session. |
| `/student/wallet` | `pages/student/Wallet.tsx` | Balance card, top-up modal (presets + custom, disabled fake card fields, clearly simulated), transaction list. |
| `/student/history`, `/student/profile` | thin pages | history uses shared list. |
| `/teacher` | `pages/teacher/TeacherDashboard.tsx` | Online/offline switch (role=switch), 4 stat cards, current-session banner, **live request cards** (subject/level/grade/topic/desc/duration/price/student rating/accept/details), already-taken modal, today's sessions. |
| `/teacher/earnings`, `/teacher/history`, `/teacher/profile` | teacher pages | earnings card notes commission config; profile shows demo-verified caveat. |
| `/session/:id` | `pages/session/SessionRoom.tsx` | Dark room: header (topic, timer, report), avatar "video" tiles, whiteboard placeholder strip, controls (mic/cam/share/hand/chat/end), synced chat panel, end-confirm modal (states the charge), participant-only access. Auto-redirects to complete when the other side ends. |
| `/session/:id/complete` | `pages/session/SessionComplete.tsx` | Role-aware money summary + star rating + optional feedback; handles already-rated. |
| `/legal/:doc` | `pages/legal/LegalPage.tsx` | privacy / terms / cookies / refunds / contact — original demo drafts, every uncertainty flagged `[Requires … review]`, placeholders from brand config. |
| `*` | `pages/NotFound.tsx` | 404. |

## 3. How to add things (recipes)

- **New UI string**: add to `en` AND `ar` in `translations.ts` → `t('your.key')`. TS enforces the AR entry.
- **New subject**: add to `subjects.ts` (id, names, icon key, levels) and map the icon in `ui.tsx: subjectIcons` if new.
- **Change pricing**: edit `config/pricing.ts` only. If you change secondary/60 away from 35 SAR, update README demo script numbers.
- **New entity**: add type to `types.ts`, add collection to `DB` + `seed.ts` (bump `DB_VERSION`), add api functions, then UI.
- **New page**: create under `pages/`, add route in `App.tsx` wrapped in `RequireRole` + `AppShell` if authed.
- **Real backend later**: reimplement `api.ts` functions as HTTP calls; replace `useDB()` selectors with your data-fetching; delete `db.ts`. Nothing else should need to change.

## 4. Suggested next steps (in priority order)

1. **Visual QA pass on real screens** (this build was verified functionally + by DOM; eyeball spacing on mobile 375px, tablet, desktop; check AR line-heights).
2. Self-host the two font families (removes the only third-party request) — update Cookie/Privacy pages accordingly.
3. Add `favorite tutors` (data model ready: add `favoriteTeacherIds` to `StudentProfile`).
4. Session-room polish: fake "connection quality" indicator, teacher notes panel.
5. Real backend spike: Supabase/Firebase or a small API implementing `api.ts`'s contract (esp. transactional `acceptRequest`).
6. Accessibility audit with a screen reader (NVDA) — semantics are in place (labels, roles, focus trap, aria-live) but need human verification.
7. Automated tests: Playwright script following README's 2-minute demo script; unit tests for `pricing.ts` and `api.ts` state machine.

## 5. Testing checklist after any change

`npm run build` green → sign in both demo roles → full two-tab flow →
cancel-before-accept → insufficient balance (set a low top-up) → already-taken
(accept from two teacher tabs) → Arabic toggle on every changed screen →
mobile bottom nav → Reset demo data restores 100 SAR.
