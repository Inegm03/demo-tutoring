import { Link, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Logo } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { BRAND } from '../../config/brand';
import NotFound from '../NotFound';

/**
 * DEMO legal drafts — original, conservative placeholder documents written
 * for this prototype. English-only drafts; binding bilingual versions and
 * review by qualified Saudi counsel (PDPL, e-commerce, consumer protection)
 * are required before any production launch.
 */

type Section = { h: string; p: string[] };
type Doc = { title: string; updated: string; sections: Section[] };

const DOCS: Record<string, Doc> = {
  privacy: {
    title: 'Privacy Policy',
    updated: '2026-09-21',
    sections: [
      { h: '1. Who we are', p: [
        `This platform (working name "Demo") is an on-demand tutoring prototype operated by ${BRAND.legalBusinessName}. This document is a demo draft: it describes how the prototype actually behaves today, and marks what must change before a real launch.`,
      ]},
      { h: '2. What data the demo collects', p: [
        'The demo stores data only in your own browser (localStorage/sessionStorage). Nothing is transmitted to our servers, because the demo has no servers. Data kept in your browser includes: the demo account you selected or created (name, email you typed, role), tutoring requests and their descriptions, simulated wallet balances and transactions, session records, chat messages typed inside demo sessions, ratings, reports, and your language preference.',
        'If you create an account in the demo, the password field is not stored — demo authentication is simulated.',
      ]},
      { h: '3. What the demo does NOT do', p: [
        'No analytics or advertising trackers run in this demo. No cookies are set by the application. No data is sent to third parties. No payment details are collected — the checkout is visually simulated and its card fields are disabled. Location, contacts, and device identifiers are not accessed.',
        'The only third-party network requests are to Google Fonts (to load the interface typefaces), which involves your IP address being seen by Google as with any web font CDN. A production build should self-host fonts to remove even this transfer. [Requires decision before production.]',
      ]},
      { h: '4. Children and minors', p: [
        'The product concept targets school students, who are typically minors. Before production launch, a full minor-privacy design is required: verifiable parental consent where applicable, guardian-managed accounts, data-minimization review, and safeguarding controls. [Requires Saudi legal review before production launch — Saudi Personal Data Protection Law (PDPL) and its Implementing Regulations.]',
      ]},
      { h: '5. Your rights', p: [
        'Because all demo data lives in your browser, you can erase everything at any time using "Reset demo data" in the profile menu, or by clearing your browser storage for this site.',
        'A production service must provide PDPL data-subject rights (access, correction, deletion, withdrawal of consent) with real processes behind them. [Requires legal review.]',
      ]},
      { h: '6. Contact', p: [
        `Privacy questions: ${BRAND.supportEmail} (placeholder — replace with a monitored address before launch).`,
      ]},
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: '2026-09-21',
    sections: [
      { h: '1. Demo status', p: [
        'This application is a non-commercial product demonstration. No real tutoring services are provided, no payments are processed, and no contractual relationship is created by using it. These draft terms exist to show the structure a real agreement would take.',
      ]},
      { h: '2. The service concept', p: [
        `${BRAND.legalBusinessName} would operate a marketplace connecting students seeking tutoring with independent tutors. The platform would facilitate discovery, session rooms, wallet payments, and ratings. Tutors would act as independent providers, not employees. [Marketplace relationship, liability allocation, and tutor contracting require Saudi legal review — including e-commerce and consumer-protection requirements.]`,
      ]},
      { h: '3. Accounts and eligibility', p: [
        'Production accounts would require accurate information. Students who are minors would require guardian consent and, where appropriate, guardian-managed accounts. Tutors would be required to complete identity and qualification verification before teaching. In this demo, all verification badges are sample data.',
      ]},
      { h: '4. Payments, pricing and wallet', p: [
        'In the demo, prices are configurable sample values shown before every request, and the wallet is simulated. A production wallet involving stored value and refunds must be reviewed for Saudi payment regulation compliance and operated with licensed payment providers. [Requires legal and regulatory review.]',
      ]},
      { h: '5. Conduct and safety', p: [
        'Users must not share personal contact details through the platform, harass others, or misuse sessions. Report and block tools are provided. The platform may suspend accounts that violate these rules.',
      ]},
      { h: '6. Content and ratings', p: [
        'Ratings and feedback must be honest and relate to real sessions. The platform may moderate user-generated content. [User-generated-content liability requires legal review.]',
      ]},
      { h: '7. Governing law', p: [
        'A production agreement would be governed by the laws of the Kingdom of Saudi Arabia. [Placeholder — confirm with counsel.]',
      ]},
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    updated: '2026-09-21',
    sections: [
      { h: '1. Does this demo use cookies?', p: [
        'No. The application sets no cookies of its own — first-party or third-party.',
      ]},
      { h: '2. What browser storage is used?', p: [
        'The demo uses localStorage and sessionStorage, which are strictly necessary for it to function: demo application data (accounts, requests, sessions, wallet, notifications), your language preference, and the per-tab signed-in demo user. No identifier is shared with any third party, and nothing leaves your browser.',
        'Because only strictly necessary storage is used and no analytics or marketing technologies run, a consent banner is not displayed. If analytics, marketing tools, or third-party embeds are added in production, this policy and the consent mechanism must be revisited before those technologies activate. [Requires review at that time.]',
      ]},
      { h: '3. Third-party requests', p: [
        'Interface fonts load from Google Fonts. Google may log the network request (including IP address) as part of serving the files; no cookies are set by this. Self-hosting fonts in production would remove this request entirely.',
      ]},
      { h: '4. Managing storage', p: [
        'Use "Reset demo data" in the app, or clear this site\'s data in your browser settings, to remove everything.',
      ]},
    ],
  },
  refunds: {
    title: 'Refund & Cancellation Policy',
    updated: '2026-09-21',
    sections: [
      { h: '1. Demo rules', p: [
        'These are the rules the demo actually implements. Production rules are configurable placeholders and must be finalized with the business and reviewed under Saudi consumer-protection requirements. [Requires legal review before production.]',
      ]},
      { h: '2. When is the wallet charged?', p: [
        'The wallet is charged only when a session is completed. Sending a request, being matched, and entering a session do not charge the wallet.',
      ]},
      { h: '3. Cancellation before a tutor accepts', p: [
        'Free, always. The request is withdrawn and nothing is charged.',
      ]},
      { h: '4. Cancellation after a tutor accepts', p: [
        'In the demo: the session is cancelled and nothing is charged (payment only happens at completion). In production, a fairness window and possible late-cancellation fee are open business decisions. [Configurable placeholder — not finalized.]',
      ]},
      { h: '5. Tutor cancels or does not attend', p: [
        'The student is never charged. In production, repeated tutor no-shows would affect tutor standing.',
      ]},
      { h: '6. Student does not attend', p: [
        'Production policy undecided (e.g., partial fee after a grace period). [Configurable placeholder — not finalized.]',
      ]},
      { h: '7. Technical failure', p: [
        'If a session cannot begin or is interrupted by a platform failure, any charge is refunded to the wallet in full.',
      ]},
      { h: '8. How refunds are paid', p: [
        'Demo refunds go to the in-app wallet instantly. Production refunds to original payment methods depend on the payment provider integrated at launch. [Requires provider selection and legal review.]',
      ]},
    ],
  },
  contact: {
    title: 'Contact & Business Information',
    updated: '2026-09-21',
    sections: [
      { h: 'Business information (placeholders)', p: [
        `Legal business name: ${BRAND.legalBusinessName}`,
        `Commercial registration: ${BRAND.commercialRegistration}`,
        `Registered address: ${BRAND.registeredAddress}`,
        `VAT number: ${BRAND.vatNumber}`,
        'All values above are intentionally unfilled placeholders. Do not launch with placeholder business information — Saudi e-commerce disclosure requirements apply to real operations. [Requires completion and legal review before production.]',
      ]},
      { h: 'Contact (placeholders)', p: [
        `Support email: ${BRAND.supportEmail}`,
        `Customer service: ${BRAND.customerServiceContact}`,
      ]},
      { h: 'Independence', p: [
        'Demo is an independent tutoring service prototype and is not affiliated with, endorsed by, or approved by the Saudi Ministry of Education or any government body.',
      ]},
    ],
  },
};

export default function LegalPage() {
  const { doc: docId } = useParams<{ doc: string }>();
  const { t } = useLang();
  const doc = docId ? DOCS[docId] : undefined;
  if (!doc) return <NotFound />;

  return (
    <div className="min-h-dvh bg-[#f6f8f7]">
      <header className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
        <Link to="/" aria-label={t('app.name')}><Logo /></Link>
        <Link to="/" className="text-sm font-semibold text-brand-700 hover:underline">‹ {t('common.back')}</Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-4 mb-8" role="note">
          <AlertTriangle className="h-5 w-5 text-sand-600 shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-sand-900">{t('legal.demoNotice')}</p>
        </div>
        <h1 className="text-3xl font-extrabold text-ink-950 mb-2">{doc.title}</h1>
        <p className="text-sm text-ink-400 mb-8">Demo draft · Last updated {doc.updated}</p>
        <div className="space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-bold text-ink-900 mb-2.5">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="text-[15px] text-ink-600 leading-relaxed mb-2.5">{para}</p>
              ))}
            </section>
          ))}
        </div>
        <nav className="mt-12 pt-6 border-t border-ink-200 flex flex-wrap gap-4 text-sm font-semibold text-brand-700" aria-label={t('landing.footer.legal')}>
          {Object.entries(DOCS).map(([id, d]) => (
            <Link key={id} to={`/legal/${id}`} className="hover:underline">{d.title}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
