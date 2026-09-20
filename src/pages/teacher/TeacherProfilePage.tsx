import { BadgeCheck, FileText } from 'lucide-react';
import { Avatar, Stars, DemoTag } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LanguageContext';
import { useDB } from '../../lib/db';
import { getSubject } from '../../lib/subjects';
import { formatDate } from '../../lib/format';

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const db = useDB();
  if (!user) return null;
  const profile = db.teacherProfiles.find((p) => p.userId === user.id);
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-ink-950">{t('prof.title')}</h1>

      <div className="card p-7">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-5">
          <Avatar name={lang === 'ar' ? user.nameAr : user.name} hue={user.avatarHue} size={88} />
          <div className="text-center sm:text-start flex-1">
            <p className="text-xl font-extrabold text-ink-900 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              {lang === 'ar' ? user.nameAr : user.name}
              {profile.demoVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-0.5">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {t('prof.demoVerified')}
                </span>
              )}
            </p>
            <p className="text-ink-500 text-sm mt-0.5">
              {t('role.teacher')} · {t('prof.experience', { n: profile.yearsExperience })} · {t('prof.memberSince', { date: formatDate(user.createdAt, lang) })}
            </p>
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-3">
              {profile.ratingCount > 0 && <Stars value={profile.rating} count={profile.ratingCount} />}
              <span className="text-sm text-ink-500">{t('prof.completed', { n: profile.completedSessions })}</span>
            </div>
          </div>
        </div>
        {profile.demoVerified && <p className="text-xs text-ink-400 mb-4">{t('prof.demoVerifiedNote')}</p>}
        <p className="text-[15px] text-ink-700 leading-relaxed">{lang === 'ar' ? profile.bioAr : profile.bio}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <section className="card p-6">
          <h2 className="font-bold text-ink-900 mb-4">{t('prof.subjects')}</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {profile.subjects.map((id) => {
              const s = getSubject(id);
              return s ? (
                <span key={id} className="rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
                  {lang === 'ar' ? s.nameAr : s.nameEn}
                </span>
              ) : null;
            })}
          </div>
          <h3 className="text-sm font-bold text-ink-700 mb-2">{t('prof.levels')}</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {profile.levels.map((l) => (
              <span key={l} className="rounded-full bg-ink-50 px-3 py-1 text-sm font-semibold text-ink-600">
                {t(`level.${l}` as Parameters<typeof t>[0])}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-bold text-ink-700 mb-2">{t('prof.languages')}</h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((l) => (
              <span key={l} className="rounded-full bg-ink-50 px-3 py-1 text-sm font-semibold text-ink-600">
                {t(l === 'ar' ? 'prof.language.ar' : 'prof.language.en')}
              </span>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-bold text-ink-900 mb-3 flex items-center gap-2">{t('prof.qualifications')} <DemoTag /></h2>
          <div className="rounded-xl border border-dashed border-ink-200 p-5 text-center">
            <FileText className="h-7 w-7 text-ink-300 mx-auto mb-2" aria-hidden />
            <p className="text-sm text-ink-500">{t('prof.qualificationsPh')}</p>
          </div>
        </section>
      </div>

      <section className="card p-6">
        <h2 className="font-bold text-ink-900 mb-2 flex items-center gap-2">{t('prof.settings')} <DemoTag /></h2>
        <p className="text-sm text-ink-500">{t('prof.settingsNote')}</p>
      </section>
    </div>
  );
}
