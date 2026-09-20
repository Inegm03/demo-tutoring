import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Inbox, PowerOff, Star, CalendarCheck2, BadgeDollarSign, Timer } from 'lucide-react';
import { Button, Modal, Avatar, Stars, StatusChip, SubjectIcon, EmptyState, Skeleton } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDB } from '../../lib/db';
import { acceptRequest, openRequestsFor, setTeacherOnline, ApiError } from '../../lib/api';
import { getSubject } from '../../lib/subjects';
import { formatSAR, timeAgo } from '../../lib/format';
import type { TutoringRequest } from '../../lib/types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const db = useDB();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [togglBusy, setToggleBusy] = useState(false);
  const [acceptBusy, setAcceptBusy] = useState<string | null>(null);
  const [takenOpen, setTakenOpen] = useState(false);
  const [detail, setDetail] = useState<TutoringRequest | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(id);
  }, []);

  if (!user) return null;
  const profile = db.teacherProfiles.find((p) => p.userId === user.id);
  const online = profile?.online ?? false;
  const requests = openRequestsFor(user.id);

  const current = db.sessions.find((s) => s.teacherId === user.id && (s.status === 'upcoming' || s.status === 'live'));
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const todaySessions = db.sessions.filter((s) => s.teacherId === user.id && s.createdAt >= startOfDay.getTime());
  const earningsToday = todaySessions.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.teacherNet, 0);

  const toggle = async () => {
    setToggleBusy(true);
    await setTeacherOnline(user.id, !online);
    setToggleBusy(false);
  };

  const accept = async (req: TutoringRequest) => {
    setAcceptBusy(req.id);
    try {
      const ses = await acceptRequest(req.id, user.id);
      toast(t('tch.accepted.toast'));
      setDetail(null);
      navigate(`/session/${ses.id}`);
    } catch (err) {
      setDetail(null);
      if (err instanceof ApiError && (err.code === 'already_taken' || err.code === 'request_cancelled')) {
        setTakenOpen(true);
      } else {
        toast(t('err.generic'), 'error');
      }
    } finally {
      setAcceptBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-20" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">{t('tch.dash.title')}</h1>
          <p className="text-ink-500 mt-1">{online ? t('tch.online.hint') : t('tch.offline.hint')}</p>
        </div>
        {/* online toggle */}
        <button
          onClick={toggle}
          disabled={togglBusy}
          role="switch"
          aria-checked={online}
          aria-label={online ? t('tch.online') : t('tch.offline')}
          className={`flex items-center gap-3 rounded-full border-2 px-2 py-1.5 transition-colors ${
            online ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white'
          }`}
        >
          <span className={`text-sm font-bold ps-2 ${online ? 'text-brand-800' : 'text-ink-400'}`}>
            {online ? t('tch.online') : t('tch.offline')}
          </span>
          <span className={`relative h-8 w-14 rounded-full transition-colors ${online ? 'bg-brand-600' : 'bg-ink-200'}`}>
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                online ? 'start-7' : 'start-1'
              }`}
            />
          </span>
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BadgeDollarSign} label={t('tch.stats.earningsToday')} value={formatSAR(earningsToday, lang)} />
        <StatCard icon={BadgeDollarSign} label={t('tch.stats.earningsTotal')} value={formatSAR(profile?.totalEarnings ?? 0, lang)} />
        <StatCard icon={CalendarCheck2} label={t('tch.stats.completed')} value={String(profile?.completedSessions ?? 0)} />
        <StatCard icon={Star} label={t('tch.stats.rating')} value={profile && profile.ratingCount > 0 ? profile.rating.toFixed(1) : '—'} />
      </div>

      {/* current session */}
      {current && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 border-brand-200 bg-gradient-to-r from-brand-50 to-white flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <StudentBadge id={current.studentId} />
            <div>
              <p className="font-bold text-ink-900">{t('tch.current.title')}</p>
              <p className="text-sm text-ink-500">{subjName(current.subjectId, lang)} · {current.topic}</p>
            </div>
            <StatusChip status={current.status} />
          </div>
          <Button onClick={() => navigate(`/session/${current.id}`)}>{t('tch.current.enter')}</Button>
        </motion.div>
      )}

      {/* live requests */}
      <section className="card p-6">
        <h2 className="flex items-center gap-2.5 font-bold text-lg text-ink-900 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            {online && <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" aria-hidden />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? 'bg-brand-500' : 'bg-ink-300'}`} aria-hidden />
          </span>
          {t('tch.requests.title')}
        </h2>

        {!online ? (
          <EmptyState icon={PowerOff} title={t('tch.requests.emptyOffline')} sub={t('tch.offline.hint')} />
        ) : requests.length === 0 ? (
          <EmptyState icon={Inbox} title={t('tch.requests.empty')} sub={t('tch.requests.emptySub')} />
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {requests.map((req) => (
                <motion.li
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-white to-brand-50/40 p-5"
                >
                  <RequestCardBody req={req} />
                  <div className="flex gap-2.5 mt-4">
                    <Button full loading={acceptBusy === req.id} onClick={() => accept(req)}>
                      {t('tch.request.accept')}
                    </Button>
                    <Button variant="outline" onClick={() => setDetail(req)}>{t('tch.request.details')}</Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* today's sessions */}
      {todaySessions.length > 0 && (
        <section className="card p-6">
          <h2 className="font-bold text-lg text-ink-900 mb-4">{t('tch.today.title')}</h2>
          <ul className="divide-y divide-ink-100">
            {todaySessions.map((s) => (
              <li key={s.id} className="py-3 flex items-center gap-3">
                <Timer className="h-4 w-4 text-ink-400" aria-hidden />
                <span className="font-semibold text-ink-900 flex-1 truncate">{subjName(s.subjectId, lang)} · {s.topic}</span>
                <span className="font-bold text-ink-900 hidden sm:block">{formatSAR(s.teacherNet, lang)}</span>
                <StatusChip status={s.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* request detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${subjName(detail.subjectId, lang)} — ${detail.topic}` : ''}>
        {detail && (
          <div className="space-y-4">
            <RequestCardBody req={detail} showDescription />
            <Button full size="lg" loading={acceptBusy === detail.id} onClick={() => accept(detail)}>
              {t('tch.request.accept')}
            </Button>
          </div>
        )}
      </Modal>

      {/* already taken */}
      <Modal open={takenOpen} onClose={() => setTakenOpen(false)} title={t('tch.request.taken.title')}>
        <p className="text-sm text-ink-600 mb-5">{t('tch.request.taken.body')}</p>
        <Button full onClick={() => setTakenOpen(false)}>{t('common.close')}</Button>
      </Modal>
    </div>
  );
}

function RequestCardBody({ req, showDescription }: { req: TutoringRequest; showDescription?: boolean }) {
  const { t, lang } = useLang();
  const db = useDB();
  const student = db.users.find((u) => u.id === req.studentId);
  const studentProfile = db.studentProfiles.find((p) => p.userId === req.studentId);
  const subject = getSubject(req.subjectId);
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span className="flex items-center gap-2.5 font-bold text-ink-900">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white border border-brand-100 text-brand-700 shadow-soft">
            <SubjectIcon icon={subject?.icon ?? 'book-open'} />
          </span>
          <span>
            {subject ? (lang === 'ar' ? subject.nameAr : subject.nameEn) : ''}
            <span className="block text-xs font-semibold text-ink-400">
              {t(`level.${req.level}` as Parameters<typeof t>[0])} · {t('grade.label', { n: req.grade })}
            </span>
          </span>
        </span>
        <span className="text-xl font-extrabold text-ink-900 whitespace-nowrap">{formatSAR(req.price, lang)}</span>
      </div>
      <p className="font-semibold text-ink-800 mb-1">{req.topic}</p>
      <p className={`text-sm text-ink-500 mb-3 ${showDescription ? '' : 'line-clamp-2'}`}>“{req.description}”</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5" aria-hidden /> {req.duration} {t('common.min')}
        </span>
        {student && studentProfile && studentProfile.ratingCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            {t('tch.request.studentRating')}: <Stars value={studentProfile.rating} />
          </span>
        )}
        <span className="text-ink-400">{timeAgo(req.createdAt, lang)}</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </p>
      <p className="text-2xl font-extrabold text-ink-950">{value}</p>
    </div>
  );
}

function StudentBadge({ id }: { id: string }) {
  const db = useDB();
  const { lang } = useLang();
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  return <Avatar name={lang === 'ar' ? u.nameAr : u.name} hue={u.avatarHue} size={40} />;
}

function subjName(id: string, lang: 'en' | 'ar'): string {
  const s = getSubject(id);
  return s ? (lang === 'ar' ? s.nameAr : s.nameEn) : id;
}
