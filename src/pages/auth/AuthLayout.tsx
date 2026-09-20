import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Logo } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';

export function AuthLayout({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  const { t, lang, setLang } = useLang();
  return (
    <div className="min-h-dvh flex flex-col bg-[#f6f8f7]">
      <header className="mx-auto w-full max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" aria-label={t('app.name')}><Logo /></Link>
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100/70 transition-colors"
        >
          <Globe className="h-4 w-4" aria-hidden />
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </header>
      <main className="flex-1 grid place-items-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-7">
            <h1 className="text-2xl font-extrabold text-ink-950">{title}</h1>
            {sub && <p className="text-ink-500 mt-1.5">{sub}</p>}
          </div>
          <div className="card p-7">{children}</div>
          <p className="text-center text-xs text-ink-400 mt-5">{t('app.demoBadge')}</p>
        </motion.div>
      </main>
    </div>
  );
}
