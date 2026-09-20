import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button, Logo } from '../components/ui';
import { useLang } from '../i18n/LanguageContext';

export default function NotFound() {
  const { lang } = useLang();
  return (
    <div className="min-h-dvh bg-[#f6f8f7] flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 h-16 flex items-center">
        <Link to="/"><Logo /></Link>
      </header>
      <main className="flex-1 grid place-items-center px-4">
        <div className="text-center">
          <Compass className="h-14 w-14 text-ink-300 mx-auto mb-4" aria-hidden />
          <h1 className="text-2xl font-extrabold text-ink-950 mb-2">404</h1>
          <p className="text-ink-500 mb-6">
            {lang === 'ar' ? 'لم نعثر على هذه الصفحة.' : "We couldn't find that page."}
          </p>
          <Link to="/"><Button>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to home'}</Button></Link>
        </div>
      </main>
    </div>
  );
}
