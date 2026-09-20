import { Avatar, Stars, DemoTag } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LanguageContext';
import { useDB } from '../../lib/db';
import { getSubject } from '../../lib/subjects';
import { formatDate, formatSAR } from '../../lib/format';
import { Link } from 'react-router-dom';

export default function StudentProfile() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const db = useDB();
  if (!user) return null;
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  const completed = db.sessions.filter((s) => s.studentId === user.id && s.status === 'completed').length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-ink-950">{t('prof.title')}</h1>

      <div className="card p-7 flex flex-col sm:flex-row items-center gap-6">
        <Avatar name={lang === 'ar' ? user.nameAr : user.name} hue={user.avatarHue} size={88} />
        <div className="text-center sm:text-start">
          <p className="text-xl font-extrabold text-ink-900">{lang === 'ar' ? user.nameAr : user.name}</p>
          <p className="text-ink-500 text-sm mt-0.5">{t('role.student')} · {t('prof.memberSince', { date: formatDate(user.createdAt, lang) })}</p>
          {profile && profile.ratingCount > 0 && (
            <div className="mt-2 flex justify-center sm:justify-start"><Stars value={profile.rating} count={profile.ratingCount} /></div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <section className="card p-6">
          <h2 className="font-bold text-ink-900 mb-4">{t('prof.academic')}</h2>
          <dl className="space-y-3 text-[15px]">
            <div className="flex justify-between"><dt className="text-ink-500">{t('req.level')}</dt><dd className="font-semibold text-ink-900">{profile ? t(`level.${profile.level}` as Parameters<typeof t>[0]) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">{t('req.grade')}</dt><dd className="font-semibold text-ink-900">{profile ? t('grade.label', { n: profile.grade }) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">{t('tch.stats.completed')}</dt><dd className="font-semibold text-ink-900">{completed}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">{t('wal.balance')}</dt><dd className="font-semibold text-ink-900">{formatSAR(profile?.walletBalance ?? 0, lang)}</dd></div>
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="font-bold text-ink-900 mb-4">{t('prof.preferredSubjects')}</h2>
          <div className="flex flex-wrap gap-2">
            {(profile?.preferredSubjects ?? []).map((id) => {
              const s = getSubject(id);
              if (!s) return null;
              return (
                <span key={id} className="rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
                  {lang === 'ar' ? s.nameAr : s.nameEn}
                </span>
              );
            })}
          </div>
        </section>
      </div>

      <section className="card p-6">
        <h2 className="font-bold text-ink-900 mb-2 flex items-center gap-2">{t('prof.settings')} <DemoTag /></h2>
        <p className="text-sm text-ink-500">{t('prof.settingsNote')}</p>
        <p className="text-sm text-ink-500 mt-2">
          <Link to="/legal/privacy" className="text-brand-700 underline">{t('landing.footer.privacy')}</Link>
          {' · '}
          <Link to="/legal/terms" className="text-brand-700 underline">{t('landing.footer.terms')}</Link>
        </p>
      </section>
    </div>
  );
}
