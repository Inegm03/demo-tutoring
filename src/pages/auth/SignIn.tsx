import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Presentation } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button, Field } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { signInDemo, signInEmail } from '../../lib/api';
import type { Role } from '../../lib/types';

export default function SignIn() {
  const { t } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; form?: string }>({});
  const [busy, setBusy] = useState<'form' | 'google' | Role | null>(null);

  const demoHint = params.get('demo'); // preselect emphasis from landing CTAs

  const goToDashboard = (role: Role) => navigate(role === 'student' ? '/student' : '/teacher');

  const demoLogin = async (role: Role) => {
    setBusy(role);
    try {
      const user = await signInDemo(role);
      goToDashboard(user.role);
    } catch {
      toast(t('err.generic'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('auth.validation.email');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy('form');
    try {
      const user = await signInEmail(email, password);
      goToDashboard(user.role);
    } catch {
      setErrors({ form: t('auth.error.invalid') });
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthLayout title={t('auth.signIn.title')} sub={t('auth.signIn.sub')}>
      {/* demo access — most important for demo viewers */}
      <div className="space-y-2.5 mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400 text-center">{t('auth.demo.divider')}</p>
        <Button
          full size="lg"
          variant={demoHint === 'teacher' ? 'outline' : 'primary'}
          loading={busy === 'student'}
          onClick={() => demoLogin('student')}
        >
          <GraduationCap className="h-5 w-5" aria-hidden />
          {t('auth.demo.student')}
        </Button>
        <Button
          full size="lg"
          variant={demoHint === 'teacher' ? 'primary' : 'outline'}
          loading={busy === 'teacher'}
          onClick={() => demoLogin('teacher')}
        >
          <Presentation className="h-5 w-5" aria-hidden />
          {t('auth.demo.teacher')}
        </Button>
        <p className="text-xs text-ink-400 text-center">{t('auth.demo.hint')}</p>
      </div>

      <div className="relative my-6" role="separator">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-ink-100" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-ink-400">•</span></div>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && (
          <p className="rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-700" role="alert">
            {errors.form}
          </p>
        )}
        <Field label={t('auth.email')} htmlFor="email" error={errors.email}>
          <input
            id="email" type="email" autoComplete="email" className="input"
            value={email} onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>
        <Field label={t('auth.password')} htmlFor="password">
          <input
            id="password" type="password" autoComplete="current-password" className="input"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="flex justify-end -mt-1">
          <Link to="/auth/forgot" className="text-sm font-semibold text-brand-700 hover:underline">{t('auth.forgot')}</Link>
        </div>
        <Button type="submit" full loading={busy === 'form'}>{t('auth.signIn.button')}</Button>
      </form>

      <Button
        full variant="outline" className="mt-3"
        loading={busy === 'google'}
        onClick={async () => {
          // DEMO: simulated OAuth — signs into the demo student account.
          setBusy('google');
          const user = await signInDemo('student');
          goToDashboard(user.role);
        }}
      >
        <GoogleIcon />
        {t('auth.google')}
      </Button>
      <p className="text-center text-xs text-ink-400 mt-2">{t('auth.googleDemo')}</p>

      <p className="text-center text-sm text-ink-500 mt-6">
        {t('auth.noAccount')}{' '}
        <Link to="/auth/register" className="font-semibold text-brand-700 hover:underline">{t('auth.createAccount')}</Link>
      </p>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4.5 w-4.5 h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.1 0-5.8-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z" />
      <path fill="#EA4335" d="M12 4.6c2.2 0 3.7.9 4.6 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.9 3c1-2.9 3.7-5 6.8-5z" />
    </svg>
  );
}
