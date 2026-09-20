import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Wallet, ArrowRight, ArrowLeft, CalendarX2, Star, Lightbulb } from 'lucide-react';
import { Button, Avatar, Stars, StatusChip, SubjectIcon, Skeleton, EmptyState } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useDB } from '../../lib/db';
import { getSubject } from '../../lib/subjects';
import { formatSAR, formatDate } from '../../lib/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t, lang, dir } = useLang();
  const db = useDB();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  if (!user) return null;
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'stu.greeting.morning' : hour < 17 ? 'stu.greeting.afternoon' : 'stu.greeting.evening';
  const firstName = (lang === 'ar' ? user.nameAr : user.name).split(' ')[0];

  const searching = db.requests.find((r) => r.studentId === user.id && r.status === 'searching');
  const activeSession = db.sessions.find((s) => s.studentId === user.id && (s.status === 'upcoming' || s.status === 'live'));
  const recent = db.sessions
    .filter((s) => s.studentId === user.id && (s.status === 'completed' || s.status === 'cancelled'))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);
  const recentTutorIds = [...new Set(recent.filter((s) => s.status === 'completed').map((s) => s.teacherId))].slice(0, 4);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid md:grid-cols-3 gap-5">
          <Skeleton className="h-44 md:col-span-2" />
          <Skeleton className="h-44" />
        </div>
        <Skeleton className="h-56" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">{t(greetKey, { name: firstName })}</h1>
        <p className="text-ink-500 mt-1">{t('stu.dash.prompt')}</p>
      </div>

      {/* live status banner */}
      {(searching || activeSession) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 border-brand-200 bg-gradient-to-r from-brand-50 to-white flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
        >
          {searching ? (
            <>
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-brand-300 animate-pulse-ring" aria-hidden />
                  <span className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </span>
                </span>
                <div>
                  <p className="font-bold text-ink-900">{t('stu.dash.searching')}</p>
                  <p className="text-sm text-ink-500">{subjectName(searching.subjectId, lang)} · {searching.topic}</p>
                </div>
              </div>
              <Button onClick={() => navigate(`/student/matching/${searching.id}`)}>
                {t('stu.dash.viewMatching')} <Arrow className="h-4 w-4" aria-hidden />
              </Button>
            </>
          ) : activeSession ? (
            <>
              <div className="flex items-center gap-3">
                <TeacherAvatarById id={activeSession.teacherId} />
                <div>
                  <p className="font-bold text-ink-900">
                    {activeSession.status === 'live' ? t('stu.dash.activeSession') : t('stu.dash.upcomingSession')}
                  </p>
                  <p className="text-sm text-ink-500">{subjectName(activeSession.subjectId, lang)} · {activeSession.topic}</p>
                </div>
              </div>
              <Button onClick={() => navigate(`/session/${activeSession.id}`)}>
                {t('stu.dash.enterSession')} <Arrow className="h-4 w-4" aria-hidden />
              </Button>
            </>
          ) : null}
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white p-7 md:p-9 flex flex-col justify-between min-h-44 shadow-lift"
        >
          <div className="absolute -end-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-extrabold mb-1.5">{t('app.tagline')}</h2>
            <p className="text-white/70 text-sm max-w-sm">{t('landing.how.1.body')}</p>
          </div>
          <div className="relative mt-6">
            <Button
              size="lg"
              className="!bg-white !text-brand-800 hover:!bg-brand-50"
              onClick={() => navigate('/student/request')}
              disabled={!!searching || !!activeSession}
            >
              {t('stu.dash.findTutor')}
              <Arrow className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </motion.div>

        {/* wallet */}
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 text-ink-500">
            <Wallet className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">{t('stu.dash.balance')}</span>
          </div>
          <p className="text-3xl font-extrabold text-ink-950 my-3">{formatSAR(profile?.walletBalance ?? 0, lang)}</p>
          <Link to="/student/wallet">
            <Button variant="secondary" full>{t('stu.dash.topUp')}</Button>
          </Link>
        </div>
      </div>

      {/* study tip of the day — small educational touch */}
      <motion.aside
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex items-start gap-3.5 rounded-2xl border border-sand-200 bg-gradient-to-r from-sand-50 to-white px-5 py-4"
      >
        <motion.span
          whileHover={{ rotate: [0, -12, 12, 0], scale: 1.15 }}
          transition={{ duration: 0.5 }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-100 text-sand-700"
        >
          <Lightbulb className="h-5 w-5" aria-hidden />
        </motion.span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sand-700">{t('tips.title')}</p>
          <p className="text-sm text-ink-700 mt-0.5">
            {t(`tips.${(Math.floor(Date.now() / 86400000) % 5) + 1}` as Parameters<typeof t>[0])}
          </p>
        </div>
      </motion.aside>

      {/* recent sessions */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-ink-900 text-lg">{t('stu.dash.recentSessions')}</h2>
          <Link to="/student/history" className="text-sm font-semibold text-brand-700 hover:underline">{t('common.viewAll')}</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={CalendarX2} title={t('stu.dash.noSessions')} sub={t('stu.dash.noSessionsSub')} />
        ) : (
          <ul className="divide-y divide-ink-100">
            {recent.map((s) => {
              const teacher = db.users.find((u) => u.id === s.teacherId);
              return (
                <li key={s.id} className="py-3.5 flex items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <SubjectIcon icon={getSubject(s.subjectId)?.icon ?? 'book-open'} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900 truncate">{s.topic}</p>
                    <p className="text-sm text-ink-500 truncate">
                      {subjectName(s.subjectId, lang)} · {teacher ? t('his.with', { name: lang === 'ar' ? teacher.nameAr : teacher.name }) : ''} · {formatDate(s.createdAt, lang)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.status === 'completed' && !s.ratingByStudent && (
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/session/${s.id}/complete`)}>
                        <Star className="h-3.5 w-3.5" aria-hidden /> {t('stu.dash.rateNow')}
                      </Button>
                    )}
                    <span className="font-bold text-ink-900 hidden sm:block">{formatSAR(s.price, lang)}</span>
                    <StatusChip status={s.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* recent tutors */}
      {recentTutorIds.length > 0 && (
        <section>
          <h2 className="font-bold text-ink-900 text-lg mb-4">{t('stu.dash.recentTutors')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentTutorIds.map((id) => {
              const u = db.users.find((x) => x.id === id);
              const p = db.teacherProfiles.find((x) => x.userId === id);
              if (!u || !p) return null;
              return (
                <div key={id} className="card p-5 text-center">
                  <Avatar name={lang === 'ar' ? u.nameAr : u.name} hue={u.avatarHue} size={52} className="mx-auto mb-2.5" />
                  <p className="font-bold text-ink-900 text-sm truncate">{lang === 'ar' ? u.nameAr : u.name}</p>
                  <p className="text-xs text-ink-400 mb-1.5 truncate">
                    {p.subjects.map((sid) => subjectName(sid, lang)).join(' · ')}
                  </p>
                  <Stars value={p.rating} className="justify-center" />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function TeacherAvatarById({ id }: { id: string }) {
  const db = useDB();
  const { lang } = useLang();
  const u = db.users.find((x) => x.id === id);
  if (!u) return null;
  return <Avatar name={lang === 'ar' ? u.nameAr : u.name} hue={u.avatarHue} size={40} />;
}

function subjectName(id: string, lang: 'en' | 'ar'): string {
  const s = getSubject(id);
  return s ? (lang === 'ar' ? s.nameAr : s.nameEn) : id;
}
