# Demo — On-demand Tutoring Marketplace (Product Demo)

An interactive, bilingual (English/Arabic RTL) demo of an on-demand tutoring
marketplace for Saudi Arabia: students request help with a specific lesson,
see the price up front, an available teacher accepts first-come-first-served,
both meet in a demo session room, the student wallet is charged on completion,
and both sides rate each other.

**This is a demo.** No real payments, video, verification, or backend exist.
Everything is simulated in the browser. See `CONTINUE.md` for the full
handoff/continuation guide.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build (output in dist/)
```

Requires Node 18+ (built and tested on Node 20.0, Vite 5, React 18, Tailwind 3.4).

## Demo access

- **Continue as Demo Student** — Sara, wallet 100 SAR, secondary level.
- **Continue as Demo Teacher** — Ahmed, Mathematics & Physics, rating 4.9.
- Both buttons are on `/auth/signin`. Registration also works (data stays in your browser).
- Email/password form: any seeded email (e.g. `demo.student@example.com`) with any password signs in — demo only.

## The 2-minute demo script

1. **Tab A**: Continue as Demo Student → *Request a tutor* → Mathematics →
   "Quadratic equations" + description → 60 min (35 SAR shown up front) → *Find a tutor*.
2. **Tab B** (second browser tab): Continue as Demo Teacher → toggle **Online**
   → the request card appears live → *Accept session*.
3. Tab A instantly shows **"Ahmed accepted your request"** → *Enter session*.
4. Either side: *Start session* → chat syncs between tabs → *End session*.
5. Completion screen: student **100 → 65 SAR**, teacher **+35 SAR**. Both rate each other.
6. Session appears in both histories; wallet shows the transaction.

Single-tab alternative: on the matching screen a clearly-labeled
**"Simulate a tutor accepting (demo)"** button appears after a few seconds.

**Reset**: avatar menu → *Reset demo data* restores the exact seeded state.

## Architecture (short version)

- **Vite + React 18 + TypeScript + Tailwind CSS 3.4 + Framer Motion + Lucide icons.**
- **No backend.** `src/lib/db.ts` persists a single JSON document in
  `localStorage`; cross-tab realtime comes free from the browser `storage`
  event. `src/lib/api.ts` is the *only* module pages talk to — it simulates an
  async API (latency, error codes, first-accept compare-and-set). Swap its
  internals for HTTP calls and the UI survives unchanged.
- **Auth is per-tab** (`sessionStorage`), which is what makes the two-tab
  student/teacher demo possible in one browser.
- **i18n**: `src/i18n/translations.ts` (EN + AR) + `LanguageContext` which sets
  `<html dir>`; all layout uses logical properties (`start`/`end`) so RTL is real.
- **Branding/business config** is centralized in `src/config/brand.ts`;
  pricing/commission rules in `src/config/pricing.ts`.

## Where the mocks are (vs. production-ready)

| Simulated (replace for production) | Where |
|---|---|
| Auth (incl. "Google" button) | `api.ts: signInDemo/signInEmail/register` |
| Payments / wallet top-up checkout | `api.ts: topUpWallet`, `Wallet.tsx` modal (card fields disabled) |
| Video/audio/screen share/whiteboard | `SessionRoom.tsx` (visual shell only) |
| Teacher verification badge | seed data `demoVerified` — labeled "demo status" in UI |
| Matching "simulate accept" | `api.ts: simulateDemoAccept` (demo-labeled button) |
| Notifications | in-app only, stored in the DB doc |

Production-shaped and reusable as-is: data model (`types.ts`), state machine
(request → accept → session → complete → rate), pricing config, i18n, routing
guards, UI system.

## Environment variables

None. There are no secrets anywhere in the codebase (nothing to leak — no keys exist).

## Rebranding

Edit `src/config/brand.ts` (name, support email, business placeholders),
`tailwind.config.js` (colors/fonts), and the `<title>`/favicon in `index.html`.
Nothing else hard-codes brand values.

## Known limitations

- Wallet/DB live in one browser; two different devices don't share state (by design, demo-only).
- Legal pages are English-only demo drafts.
- No dark mode (single calm light theme, deliberate scope cut).
- The "already taken" race is simulated compare-and-set; true concurrency needs a server.
- Background-tab animation shim in `index.html` (see comment there) exists to keep the two-tab demo lively; remove for production.

## Before any real launch (security & legal)

**Security checklist:** real authentication + hashed credentials; server-side
authorization for every role action; server-authoritative wallet ledger;
input validation server-side; rate limiting; CSP; self-hosted fonts;
audit logging; no PII in logs.

**Production Legal & Compliance Review Required** (flagged, not hidden):

1. Saudi **PDPL** + Implementing Regulations compliance (lawful basis, notices, DSR processes, breach handling).
2. **Minors**: verifiable guardian consent, guardian accounts, safeguarding policy — high priority, students are typically minors.
3. E-commerce & consumer-protection requirements (business disclosures, pricing, refunds).
4. Stored-value **wallet** regulatory treatment + licensed Saudi payment providers (mada etc.), VAT treatment.
5. Marketplace/tutor legal relationship (independent contractor status, liability).
6. UGC moderation & ratings liability; record-retention schedule; cross-border data transfer rules.
7. Cookie/consent posture must be re-checked the moment any analytics/marketing tech is added (none exists today).
8. All `[placeholder]` business info in `src/config/brand.ts` must be real before launch.
9. Session recording is **not** implemented; if ever considered, it needs explicit privacy/legal analysis first.
10. Legal pages are drafts by a non-lawyer and must be rewritten by qualified Saudi counsel (bilingual).

## Privacy posture of this demo (audited)

No cookies. No analytics. No trackers. No third-party data transfer except
Google Fonts (fonts CDN; self-host to remove). All data stays in the visitor's
browser and is erased by "Reset demo data" or clearing site data. The Cookie
Policy page in-app reflects exactly this.
