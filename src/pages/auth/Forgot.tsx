import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button, Field } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';

export default function Forgot() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.validation.email'));
      return;
    }
    setError('');
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700)); // simulated email send
    setBusy(false);
    setSent(true);
  };

  return (
    <AuthLayout title={t('auth.forgot.title')} sub={t('auth.forgot.sub')}>
      {sent ? (
        <div className="text-center space-y-4">
          <p className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-800" role="status">
            {t('auth.forgot.sent', { email })}
          </p>
          <Link to="/auth/signin" className="inline-block font-semibold text-brand-700 hover:underline">
            {t('auth.signIn.button')}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label={t('auth.email')} htmlFor="fp-email" error={error}>
            <input id="fp-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
          </Field>
          <Button type="submit" full loading={busy}>{t('auth.forgot.button')}</Button>
          <p className="text-center">
            <Link to="/auth/signin" className="text-sm font-semibold text-brand-700 hover:underline">‹ {t('common.back')}</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
