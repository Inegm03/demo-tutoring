import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Presentation } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button, Field } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { register, ApiError } from '../../lib/api';
import { LEVELS, GRADES_BY_LEVEL, SUBJECTS } from '../../lib/subjects';
import type { Level, Role } from '../../lib/types';

export default function Register() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<Level>('secondary');
  const [grade, setGrade] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false); // never pre-checked
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const toggleSubject = (id: string) =>
    setSubjects((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('auth.validation.name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('auth.validation.email');
    if (password.length < 8) errs.password = t('auth.validation.password');
    if (role === 'teacher' && subjects.length === 0) errs.subjects = t('auth.validation.subjects');
    if (!terms) errs.terms = t('auth.register.termsRequired');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const user = await register({
        role: role!, name: name.trim(), email: email.trim(),
        level, grade, subjects: role === 'teacher' ? subjects : undefined,
      });
      navigate(user.role === 'student' ? '/student' : '/teacher');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'email_taken') setErrors({ email: t('auth.error.emailTaken') });
      else setErrors({ form: t('err.generic') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={t('auth.register.title')} sub={t('auth.register.sub')}>
      {!role ? (
        <div className="space-y-3">
          <RoleCard
            icon={GraduationCap}
            title={t('auth.register.asStudent')}
            sub={t('auth.register.asStudentSub')}
            onClick={() => setRole('student')}
          />
          <RoleCard
            icon={Presentation}
            title={t('auth.register.asTeacher')}
            sub={t('auth.register.asTeacherSub')}
            onClick={() => setRole('teacher')}
          />
          <p className="text-center text-sm text-ink-500 pt-3">
            {t('auth.haveAccount')}{' '}
            <Link to="/auth/signin" className="font-semibold text-brand-700 hover:underline">{t('auth.signIn.button')}</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <button type="button" onClick={() => setRole(null)} className="text-sm font-semibold text-brand-700 hover:underline">
            ‹ {t('common.back')}
          </button>
          {errors.form && <p className="rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-700" role="alert">{errors.form}</p>}

          <Field label={t('auth.register.name')} htmlFor="reg-name" error={errors.name} hint={t('auth.register.nameWhy')}>
            <input id="reg-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
          </Field>
          <Field label={t('auth.email')} htmlFor="reg-email" error={errors.email}>
            <input id="reg-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
          </Field>
          <Field label={t('auth.password')} htmlFor="reg-pass" error={errors.password}>
            <input id="reg-pass" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
          </Field>

          {role === 'student' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('auth.register.level')} htmlFor="reg-level">
                <select id="reg-level" className="input" value={level} onChange={(e) => { setLevel(e.target.value as Level); setGrade(1); }}>
                  {LEVELS.map((l) => <option key={l} value={l}>{t(`level.${l}` as Parameters<typeof t>[0])}</option>)}
                </select>
              </Field>
              <Field label={t('auth.register.grade')} htmlFor="reg-grade">
                <select id="reg-grade" className="input" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                  {GRADES_BY_LEVEL[level].map((g) => <option key={g} value={g}>{t('grade.label', { n: g })}</option>)}
                </select>
              </Field>
            </div>
          )}

          {role === 'teacher' && (
            <fieldset>
              <legend className="label">{t('auth.register.subjects')}</legend>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id} type="button"
                    onClick={() => toggleSubject(s.id)}
                    aria-pressed={subjects.includes(s.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      subjects.includes(s.id)
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-ink-200 text-ink-600 hover:border-brand-400'
                    }`}
                  >
                    {lang === 'ar' ? s.nameAr : s.nameEn}
                  </button>
                ))}
              </div>
              {errors.subjects && <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.subjects}</p>}
            </fieldset>
          )}

          {/* consent — Terms separate from optional marketing, never pre-checked */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2.5 text-sm text-ink-700">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
              <span>
                {t('auth.register.terms')}{' '}
                (<Link to="/legal/terms" className="text-brand-700 underline" target="_blank">{t('landing.footer.terms')}</Link>,{' '}
                <Link to="/legal/privacy" className="text-brand-700 underline" target="_blank">{t('landing.footer.privacy')}</Link>)
              </span>
            </label>
            {errors.terms && <p className="text-sm text-red-600" role="alert">{errors.terms}</p>}
            <label className="flex items-start gap-2.5 text-sm text-ink-600">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
              <span>
                {t('auth.register.marketing')}
                <span className="block text-xs text-ink-400">{t('auth.register.marketingNote')}</span>
              </span>
            </label>
          </div>

          <Button type="submit" full size="lg" loading={busy}>{t('auth.register.button')}</Button>
        </form>
      )}
    </AuthLayout>
  );
}

function RoleCard({ icon: Icon, title, sub, onClick }: { icon: typeof GraduationCap; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 text-start transition-all hover:border-brand-400 hover:shadow-soft"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span>
        <span className="block font-bold text-ink-900">{title}</span>
        <span className="block text-sm text-ink-500">{sub}</span>
      </span>
    </button>
  );
}
