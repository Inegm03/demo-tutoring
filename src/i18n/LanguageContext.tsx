import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { en, ar, type TKey } from './translations';
import type { Lang } from '../lib/types';

interface LangCtx {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx | null>(null);
const LS_KEY = 'demo-tutoring-lang'; // preference storage (strictly functional)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }, []);

  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) => {
      let s: string = (lang === 'ar' ? ar[key] : en[key]) ?? en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replaceAll(`{${k}}`, String(v));
        }
      }
      return s;
    },
    [lang],
  );

  return <Ctx.Provider value={{ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang outside LanguageProvider');
  return ctx;
}
