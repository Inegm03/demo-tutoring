import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, Check, Wallet, Info } from 'lucide-react';
import { Button, Field, SubjectIcon, Modal } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDB } from '../../lib/db';
import { createRequest, ApiError } from '../../lib/api';
import { SUBJECTS, LEVELS, GRADES_BY_LEVEL, getSubject } from '../../lib/subjects';
import { SESSION_DURATIONS, sessionPrice } from '../../config/pricing';
import { formatSAR } from '../../lib/format';
import type { Level, SessionDuration } from '../../lib/types';

export default function RequestWizard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const db = useDB();
  const navigate = useNavigate();

  const profile = db.studentProfiles.find((p) => p.userId === user?.id);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>(profile?.level ?? 'secondary');
  const [grade, setGrade] = useState(profile?.grade ?? 1);
  const [subjectId, setSubjectId] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [desc, setDesc] = useState('');
  const [attach, setAttach] = useState(false);
  const [duration, setDuration] = useState<SessionDuration>(60);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [insufficientOpen, setInsufficientOpen] = useState(false);

  const price = useMemo(() => sessionPrice(level, duration), [level, duration]);
  const balance = profile?.walletBalance ?? 0;
  const subjectsForLevel = SUBJECTS.filter((s) => s.levels.includes(level));
  const steps = [t('req.step.what'), t('req.step.details'), t('req.step.review')];

  const next = () => {
    if (step === 0 && !subjectId) return;
    if (step === 1) {
      const errs: Record<string, string> = {};
      if (!topic.trim()) errs.topic = t('req.validation.topic');
      if (!desc.trim()) errs.desc = t('req.validation.desc');
      setErrors(errs);
      if (Object.keys(errs).length) return;
    }
    setStep((s) => Math.min(2, s + 1));
  };

  const submit = async () => {
    if (!user) return;
    if (balance < price) {
      setInsufficientOpen(true);
      return;
    }
    setBusy(true);
    try {
      const req = await createRequest({
        studentId: user.id, subjectId, level, grade,
        topic: topic.trim(), description: desc.trim(), duration,
      });
      navigate(`/student/matching/${req.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'insufficient_balance') setInsufficientOpen(true);
      else toast(t('err.generic'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-ink-950 mb-6">{t('req.title')}</h1>

      {/* progress */}
      <ol className="flex items-center gap-2 mb-8" aria-label={t('req.title')}>
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2 flex-1">
            <span
              aria-current={i === step ? 'step' : undefined}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-100 text-brand-800 ring-2 ring-brand-500' : 'bg-ink-100 text-ink-400'
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-ink-900' : 'text-ink-400'}`}>{label}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-ink-200" aria-hidden />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {step === 0 && (
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('req.level')} htmlFor="w-level">
                  <select id="w-level" className="input" value={level}
                    onChange={(e) => { setLevel(e.target.value as Level); setGrade(1); setSubjectId(''); }}>
                    {LEVELS.map((l) => <option key={l} value={l}>{t(`level.${l}` as Parameters<typeof t>[0])}</option>)}
                  </select>
                </Field>
                <Field label={t('req.grade')} htmlFor="w-grade">
                  <select id="w-grade" className="input" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                    {GRADES_BY_LEVEL[level].map((g) => <option key={g} value={g}>{t('grade.label', { n: g })}</option>)}
                  </select>
                </Field>
              </div>
              <fieldset>
                <legend className="label">{t('req.subject')}</legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subjectsForLevel.map((s) => (
                    <motion.button
                      key={s.id} type="button"
                      onClick={() => setSubjectId(s.id)}
                      aria-pressed={subjectId === s.id}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-colors ${
                        subjectId === s.id
                          ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-soft'
                          : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'
                      }`}
                    >
                      <motion.span
                        animate={subjectId === s.id ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                        transition={{ duration: 0.45 }}
                      >
                        <SubjectIcon icon={s.icon} className="h-6 w-6" />
                      </motion.span>
                      <span className="text-center leading-tight">{lang === 'ar' ? s.nameAr : s.nameEn}</span>
                    </motion.button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 1 && (
            <div className="card p-6 space-y-5">
              <Field label={t('req.topic')} htmlFor="w-topic" error={errors.topic}>
                <input id="w-topic" className="input" placeholder={t('req.topic.ph')} value={topic}
                  onChange={(e) => setTopic(e.target.value)} maxLength={120} aria-invalid={!!errors.topic} />
              </Field>
              <Field label={t('req.desc')} htmlFor="w-desc" error={errors.desc} hint={t('req.desc.why')}>
                <textarea id="w-desc" className="input min-h-28 resize-y" placeholder={t('req.desc.ph')} value={desc}
                  onChange={(e) => setDesc(e.target.value)} maxLength={600} aria-invalid={!!errors.desc} />
              </Field>
              <div>
                <span className="label">{t('req.attachment')} <span className="font-normal text-ink-400">({t('common.optional')})</span></span>
                <button
                  type="button"
                  onClick={() => setAttach((a) => !a)}
                  aria-pressed={attach}
                  className={`flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm font-medium transition-colors ${
                    attach ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-ink-300 text-ink-500 hover:border-brand-300'
                  }`}
                >
                  <Paperclip className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />
                  {attach ? t('req.attachment.added') : t('req.attachment')}
                </button>
                <p className="mt-1 text-xs text-ink-400">{t('req.attachment.demo')}</p>
              </div>
              <fieldset>
                <legend className="label">{t('req.duration')}</legend>
                <div className="grid grid-cols-4 gap-2.5">
                  {SESSION_DURATIONS.map((d) => (
                    <button
                      key={d} type="button"
                      onClick={() => setDuration(d)}
                      aria-pressed={duration === d}
                      className={`relative rounded-xl border px-2 py-3 text-center transition-all ${
                        duration === d ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      {d === 60 && (
                        <span className="absolute -top-2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-full bg-sand-400 px-2 py-0.5 text-[10px] font-bold text-sand-900">
                          {t('req.recommended')}
                        </span>
                      )}
                      <span className={`block text-lg font-extrabold ${duration === d ? 'text-brand-800' : 'text-ink-800'}`}>{d}</span>
                      <span className="block text-xs text-ink-400">{t('common.min')}</span>
                      <span className={`block text-xs font-bold mt-1 ${duration === d ? 'text-brand-700' : 'text-ink-500'}`}>
                        {formatSAR(sessionPrice(level, d), lang)}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-ink-900">{t('req.summary.title')}</h2>
              <dl className="space-y-2.5 text-[15px]">
                <Row k={t('req.subject')} v={`${getSubject(subjectId) ? (lang === 'ar' ? getSubject(subjectId)!.nameAr : getSubject(subjectId)!.nameEn) : ''}`} />
                <Row k={t('req.level')} v={`${t(`level.${level}` as Parameters<typeof t>[0])} · ${t('grade.label', { n: grade })}`} />
                <Row k={t('req.topic')} v={topic} />
                <Row k={t('req.duration')} v={`${duration} ${t('common.minutes')}`} />
              </dl>
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-900">{t('req.price')}</p>
                  <p className="text-xs text-brand-700/70 mt-0.5">{t('req.price.note')}</p>
                </div>
                <p className="text-2xl font-extrabold text-brand-900">{formatSAR(price, lang)}</p>
              </div>
              <p className="text-sm text-ink-500 flex items-center gap-2">
                <Wallet className="h-4 w-4 shrink-0" aria-hidden />
                {t('req.balanceAfter', { amount: formatSAR(balance - price, lang) })}
              </p>
              <p className="text-xs text-ink-400 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                <span>{t('req.cancelPolicyNote')} <Link to="/legal/refunds" className="underline" target="_blank">{t('landing.footer.refunds')}</Link></span>
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* nav buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => (step === 0 ? navigate('/student') : setStep((s) => s - 1))}>
          {t('common.back')}
        </Button>
        {step < 2 ? (
          <Button onClick={next} disabled={step === 0 && !subjectId}>{t('common.next')}</Button>
        ) : (
          <Button size="lg" loading={busy} onClick={submit}>{t('req.submit')}</Button>
        )}
      </div>

      {/* insufficient balance */}
      <Modal open={insufficientOpen} onClose={() => setInsufficientOpen(false)} title={t('req.insufficient.title')}>
        <p className="text-sm text-ink-600 mb-5">
          {t('req.insufficient.body', { price: formatSAR(price, lang), balance: formatSAR(balance, lang) })}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setInsufficientOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={() => navigate('/student/wallet')}>{t('req.insufficient.cta')}</Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{k}</dt>
      <dd className="font-semibold text-ink-900 text-end">{v}</dd>
    </div>
  );
}
