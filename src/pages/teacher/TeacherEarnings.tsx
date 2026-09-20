import { ArrowDownLeft, ReceiptText, Info } from 'lucide-react';
import { EmptyState, DemoTag } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LanguageContext';
import { useDB } from '../../lib/db';
import { formatSAR, formatDateTime } from '../../lib/format';
import { getSubject } from '../../lib/subjects';
import { PLATFORM_COMMISSION_RATE } from '../../config/pricing';
import type { TKey } from '../../i18n/translations';

export default function TeacherEarnings() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const db = useDB();
  if (!user) return null;
  const profile = db.teacherProfiles.find((p) => p.userId === user.id);
  const txs = db.transactions.filter((x) => x.userId === user.id && x.type === 'earning').sort((a, b) => b.createdAt - a.createdAt);

  const txNote = (noteKey: string, params?: Record<string, string>) => {
    const p = params?.subject
      ? { ...params, subject: (() => { const s = getSubject(params.subject); return s ? (lang === 'ar' ? s.nameAr : s.nameEn) : params.subject; })() }
      : params;
    return t(noteKey as TKey, p);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-ink-950">{t('nav.earnings')}</h1>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-ink-950 text-white p-7 shadow-lift">
        <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
        <p className="relative text-white/60 text-sm font-semibold mb-2">{t('tch.stats.earningsTotal')} <DemoTag /></p>
        <p className="relative text-4xl font-extrabold tracking-tight">{formatSAR(profile?.totalEarnings ?? 0, lang)}</p>
        <p className="relative mt-3 flex items-start gap-1.5 text-xs text-white/50 max-w-md">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          {PLATFORM_COMMISSION_RATE === 0
            ? 'Gross demo earnings. Platform commission is a configurable value (currently 0%) — real payout rules require a finalized business model.'
            : `Net of configurable demo commission (${PLATFORM_COMMISSION_RATE * 100}%).`}
        </p>
      </div>

      <section className="card p-6">
        <h2 className="font-bold text-lg text-ink-900 mb-4">{t('wal.history')}</h2>
        {txs.length === 0 ? (
          <EmptyState icon={ReceiptText} title={t('wal.empty')} sub={t('wal.emptySub')} />
        ) : (
          <ul className="divide-y divide-ink-100">
            {txs.map((tx) => (
              <li key={tx.id} className="py-3.5 flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <ArrowDownLeft className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900 truncate">{txNote(tx.noteKey, tx.noteParams)}</p>
                  <p className="text-sm text-ink-400">{formatDateTime(tx.createdAt, lang)}</p>
                </div>
                <p className="font-bold text-brand-700 shrink-0">+{formatSAR(tx.amount, lang)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
