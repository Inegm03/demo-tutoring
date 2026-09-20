import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, ReceiptText, ShieldCheck, CreditCard } from 'lucide-react';
import { Button, Modal, EmptyState, DemoTag } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDB } from '../../lib/db';
import { topUpWallet } from '../../lib/api';
import { TOPUP_PRESETS } from '../../config/pricing';
import { formatSAR, formatDateTime } from '../../lib/format';
import { getSubject } from '../../lib/subjects';
import type { TKey } from '../../i18n/translations';

export default function Wallet() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const db = useDB();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  const txs = db.transactions.filter((x) => x.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);

  const finalAmount = custom ? Math.max(0, Math.min(5000, Math.round(Number(custom) || 0))) : amount;

  const pay = async () => {
    if (finalAmount <= 0) return;
    setBusy(true);
    try {
      await topUpWallet(user.id, finalAmount);
      toast(t('wal.topup.success', { amount: formatSAR(finalAmount, lang) }));
      setOpen(false);
      setCustom('');
    } catch {
      toast(t('err.generic'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const txNote = (noteKey: string, params?: Record<string, string>) => {
    const p = params?.subject
      ? { ...params, subject: (() => { const s = getSubject(params.subject); return s ? (lang === 'ar' ? s.nameAr : s.nameEn) : params.subject; })() }
      : params;
    return t(noteKey as TKey, p);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-ink-950">{t('wal.title')}</h1>

      {/* balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-ink-950 text-white p-7 shadow-lift">
        <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="relative flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="flex items-center gap-2 text-white/60 text-sm font-semibold mb-2">
              <WalletIcon className="h-4 w-4" aria-hidden /> {t('wal.balance')}
            </p>
            <p className="text-4xl font-extrabold tracking-tight">{formatSAR(profile?.walletBalance ?? 0, lang)}</p>
          </div>
          <Button className="!bg-white !text-ink-900 hover:!bg-brand-50" onClick={() => setOpen(true)}>
            {t('wal.add')}
          </Button>
        </div>
      </div>

      {/* transactions */}
      <section className="card p-6">
        <h2 className="font-bold text-lg text-ink-900 mb-4">{t('wal.history')}</h2>
        {txs.length === 0 ? (
          <EmptyState icon={ReceiptText} title={t('wal.empty')} sub={t('wal.emptySub')} />
        ) : (
          <ul className="divide-y divide-ink-100">
            {txs.map((tx) => (
              <li key={tx.id} className="py-3.5 flex items-center gap-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tx.amount >= 0 ? 'bg-brand-50 text-brand-700' : 'bg-ink-50 text-ink-500'}`}>
                  {tx.amount >= 0 ? <ArrowDownLeft className="h-5 w-5" aria-hidden /> : <ArrowUpRight className="h-5 w-5" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900 truncate">{txNote(tx.noteKey, tx.noteParams)}</p>
                  <p className="text-sm text-ink-400">{formatDateTime(tx.createdAt, lang)} · {t(tx.status === 'completed' ? 'wal.status.completed' : 'wal.status.pending')}</p>
                </div>
                <p className={`font-bold shrink-0 ${tx.amount >= 0 ? 'text-brand-700' : 'text-ink-900'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatSAR(tx.amount, lang)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* top-up modal — simulated checkout */}
      <Modal open={open} onClose={() => setOpen(false)} title={t('wal.topup.title')}>
        <div className="space-y-5">
          <p className="flex items-start gap-2 rounded-xl bg-sand-50 border border-sand-200 px-3.5 py-2.5 text-xs text-sand-800">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            {t('wal.topup.simNote')}
          </p>
          <fieldset>
            <legend className="label">{t('wal.topup.choose')}</legend>
            <div className="grid grid-cols-4 gap-2.5">
              {TOPUP_PRESETS.map((v) => (
                <button
                  key={v} type="button"
                  onClick={() => { setAmount(v); setCustom(''); }}
                  aria-pressed={!custom && amount === v}
                  className={`rounded-xl border py-3 font-extrabold transition-all ${
                    !custom && amount === v ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-soft' : 'border-ink-200 text-ink-700 hover:border-brand-300'
                  }`}
                >
                  {v}
                  <span className="block text-[10px] font-semibold text-ink-400">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="label" htmlFor="wal-custom">{t('wal.topup.custom')}</label>
            <input
              id="wal-custom" type="number" min={1} max={5000} inputMode="numeric"
              className="input" value={custom} onChange={(e) => setCustom(e.target.value)}
            />
          </div>
          <div>
            <p className="label flex items-center gap-2">{t('wal.topup.card')} <DemoTag /></p>
            <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 space-y-2.5" aria-label={t('wal.topup.cardDemo')}>
              <div className="flex items-center gap-2.5 text-ink-400">
                <CreditCard className="h-5 w-5" aria-hidden />
                <span className="tracking-widest font-mono text-sm">•••• •••• •••• ••••</span>
              </div>
              <div className="flex gap-2.5">
                <span className="h-9 flex-1 rounded-lg bg-white border border-ink-200" aria-hidden />
                <span className="h-9 w-20 rounded-lg bg-white border border-ink-200" aria-hidden />
              </div>
              <p className="text-xs text-ink-400">{t('wal.topup.cardDemo')}</p>
            </div>
          </div>
          <Button full size="lg" loading={busy} disabled={finalAmount <= 0} onClick={pay}>
            {busy ? t('wal.topup.processing') : t('wal.topup.pay', { amount: formatSAR(finalAmount, lang) })}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
