import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Lightbulb, PartyPopper, BadgeCheck } from 'lucide-react';
import { Button, Modal, Avatar, Stars, DemoTag, SubjectIcon } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useDB } from '../../lib/db';
import { cancelRequest, simulateDemoAccept } from '../../lib/api';
import { getSubject } from '../../lib/subjects';
import { formatSAR } from '../../lib/format';

export default function Matching() {
  const { id } = useParams<{ id: string }>();
  const db = useDB();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState<'cancel' | 'simulate' | null>(null);
  const [showTip, setShowTip] = useState(false);

  const request = db.requests.find((r) => r.id === id);
  const session = request?.status === 'accepted' ? db.sessions.find((s) => s.requestId === request.id) : undefined;
  const teacher = session ? db.users.find((u) => u.id === session.teacherId) : undefined;
  const teacherProfile = session ? db.teacherProfiles.find((p) => p.userId === session.teacherId) : undefined;
  const subject = request ? getSubject(request.subjectId) : undefined;

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!request) {
    navigate('/student', { replace: true });
    return null;
  }

  const doCancel = async () => {
    setBusy('cancel');
    try {
      await cancelRequest(request.id);
      toast(t('match.cancelled'), 'info');
      navigate('/student');
    } catch {
      toast(t('err.generic'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const doSimulate = async () => {
    setBusy('simulate');
    try {
      await simulateDemoAccept(request.id);
    } catch {
      toast(t('err.generic'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const subjectLabel = subject ? (lang === 'ar' ? subject.nameAr : subject.nameEn) : '';

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <AnimatePresence mode="wait">
        {request.status === 'searching' && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="text-center">
            {/* radar animation */}
            <div className="relative mx-auto mb-8 grid h-32 w-32 place-items-center" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-brand-200/60 animate-pulse-ring" />
              <span className="absolute inset-3 rounded-full bg-brand-300/50 animate-pulse-ring [animation-delay:0.5s]" />
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-white shadow-lift">
                <Search className="h-9 w-9" />
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-ink-950 mb-2" role="status">{t('match.searching')}</h1>
            <p className="text-ink-500 mb-8">{t('match.searchingSub', { subject: subjectLabel })}</p>

            {/* request summary */}
            <div className="card p-5 text-start mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">{t('match.yourRequest')}</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <SubjectIcon icon={subject?.icon ?? 'book-open'} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-900">{subjectLabel}</p>
                  <p className="text-sm text-ink-500 truncate">{request.topic}</p>
                </div>
                <p className="text-xl font-extrabold text-ink-900">{formatSAR(request.price, lang)}</p>
              </div>
              <div className="flex gap-2 text-xs font-semibold text-ink-500">
                <span className="rounded-full bg-ink-50 px-2.5 py-1">{t(`level.${request.level}` as Parameters<typeof t>[0])} · {t('grade.label', { n: request.grade })}</span>
                <span className="rounded-full bg-ink-50 px-2.5 py-1">{request.duration} {t('common.min')}</span>
              </div>
            </div>

            {/* demo tip */}
            <AnimatePresence>
              {showTip && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl border border-sand-200 bg-sand-50 p-4 text-start mb-6"
                >
                  <p className="flex items-center gap-2 font-bold text-sand-900 text-sm mb-1">
                    <Lightbulb className="h-4 w-4" aria-hidden /> {t('match.tip.title')} <DemoTag />
                  </p>
                  <p className="text-sm text-sand-800/80 mb-3">{t('match.tip.body')}</p>
                  <Button variant="outline" size="sm" loading={busy === 'simulate'} onClick={doSimulate} className="!border-sand-300">
                    {t('match.simulate')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <Button variant="ghost" onClick={() => setCancelOpen(true)} className="text-ink-500">
              {t('match.cancel')}
            </Button>
          </motion.div>
        )}

        {request.status === 'accepted' && session && teacher && teacherProfile && (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.25 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15, bounce: 0.5 }}
              className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white shadow-lift"
            >
              <PartyPopper className="h-8 w-8" aria-hidden />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-ink-950 mb-1.5">
              {t('match.accepted.title', { name: lang === 'ar' ? teacher.nameAr : teacher.name })}
            </h1>
            <p className="text-ink-500 mb-7">{t('match.accepted.sub')}</p>

            {/* teacher card */}
            <div className="card p-6 text-start mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={lang === 'ar' ? teacher.nameAr : teacher.name} hue={teacher.avatarHue} size={64} />
                <div className="min-w-0">
                  <p className="font-extrabold text-lg text-ink-900 flex items-center gap-2">
                    {lang === 'ar' ? teacher.nameAr : teacher.name}
                    {teacherProfile.demoVerified && (
                      <span title={t('prof.demoVerifiedNote')} className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {t('prof.demoVerified')}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-ink-500 mt-1">
                    <Stars value={teacherProfile.rating} count={teacherProfile.ratingCount} />
                    <span>·</span>
                    <span>{t('prof.completed', { n: teacherProfile.completedSessions })}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-ink-600 leading-relaxed mb-4">{lang === 'ar' ? teacherProfile.bioAr : teacherProfile.bio}</p>
              <dl className="grid grid-cols-3 gap-3 text-center border-t border-ink-100 pt-4">
                <div>
                  <dt className="text-xs text-ink-400 font-semibold">{t('req.topic')}</dt>
                  <dd className="text-sm font-bold text-ink-900 truncate">{session.topic}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400 font-semibold">{t('req.duration')}</dt>
                  <dd className="text-sm font-bold text-ink-900">{session.duration} {t('common.min')}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400 font-semibold">{t('req.price')}</dt>
                  <dd className="text-sm font-bold text-ink-900">{formatSAR(session.price, lang)}</dd>
                </div>
              </dl>
            </div>

            <Button size="lg" full onClick={() => navigate(`/session/${session.id}`)}>
              {t('match.enterSession')}
            </Button>
          </motion.div>
        )}

        {(request.status === 'cancelled' || request.status === 'expired') && (
          <motion.div key="gone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <h1 className="text-xl font-extrabold text-ink-900 mb-2">{t('match.expired.title')}</h1>
            <p className="text-ink-500 mb-6">{t('match.expired.body')}</p>
            <Button onClick={() => navigate('/student')}>{t('done.backHome')}</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={t('match.cancelConfirm.title')}>
        <p className="text-sm text-ink-600 mb-5">{t('match.cancelConfirm.body')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCancelOpen(false)}>{t('match.cancelConfirm.keep')}</Button>
          <Button variant="danger" loading={busy === 'cancel'} onClick={doCancel}>{t('match.cancelConfirm.yes')}</Button>
        </div>
      </Modal>
    </div>
  );
}
