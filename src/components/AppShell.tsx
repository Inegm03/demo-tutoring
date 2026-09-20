import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell, Home, Wallet, History, User as UserIcon, LogOut, ChevronDown,
  RotateCcw, Globe, LifeBuoy, BadgeDollarSign,
} from 'lucide-react';
import { Logo, Avatar, Modal, Button, DemoTag } from './ui';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDB, resetDemoData } from '../lib/db';
import { markNotificationsRead, signOut } from '../lib/api';
import { timeAgo } from '../lib/format';
import type { TKey } from '../i18n/translations';
import { BRAND } from '../config/brand';

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t, lang, setLang } = useLang();
  const db = useDB();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isStudent = user?.role === 'student';
  const base = isStudent ? '/student' : '/teacher';

  const nav = [
    { to: base, icon: Home, label: t('nav.dashboard'), end: true },
    isStudent
      ? { to: '/student/wallet', icon: Wallet, label: t('nav.wallet') }
      : { to: '/teacher/earnings', icon: BadgeDollarSign, label: t('nav.earnings') },
    { to: `${base}/history`, icon: History, label: t('nav.history') },
    { to: `${base}/profile`, icon: UserIcon, label: t('nav.profile') },
  ];

  const myNotifs = db.notifications.filter((n) => n.userId === user?.id).slice(0, 20);
  const unread = myNotifs.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* demo banner */}
      <div className="bg-ink-900 text-white/90 text-center text-xs py-1.5 px-4 font-medium">
        {t('app.demoBadge')}
      </div>

      {/* top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link to={base} aria-label={t('app.name')} className="shrink-0">
            <Logo />
          </Link>

          {/* desktop nav */}
          <nav aria-label={t('nav.menu')} className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors"
              aria-label={t('common.language')}
            >
              <Globe className="h-4 w-4" aria-hidden />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((o) => !o);
                  if (!notifOpen && user) markNotificationsRead(user.id);
                }}
                aria-label={`${t('nav.notifications')}${unread ? ` (${unread})` : ''}`}
                aria-expanded={notifOpen}
                className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-50 transition-colors"
              >
                <Bell className="h-5 w-5" aria-hidden />
                {unread > 0 && (
                  <span className="absolute top-1.5 end-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute end-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto"
                    role="region" aria-label={t('ntf.title')}
                  >
                    <p className="px-3 py-2 text-sm font-bold text-ink-900">{t('ntf.title')}</p>
                    {myNotifs.length === 0 && <p className="px-3 pb-3 text-sm text-ink-500">{t('ntf.empty')}</p>}
                    {myNotifs.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setNotifOpen(false);
                          if (n.href) navigate(n.href);
                        }}
                        className={`w-full text-start rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-ink-50 ${n.read ? 'text-ink-600' : 'text-ink-900 font-medium'}`}
                      >
                        {t(n.key as TKey, resolveParams(n.params, t))}
                        <span className="block text-xs text-ink-400 mt-0.5">{timeAgo(n.createdAt, lang)}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* profile dropdown */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-label={t('nav.profile')}
                  className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-ink-50 transition-colors"
                >
                  <Avatar name={lang === 'ar' ? user.nameAr : user.name} hue={user.avatarHue} size={34} />
                  <ChevronDown className="h-4 w-4 text-ink-400 hidden sm:block" aria-hidden />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      className="absolute end-0 mt-2 w-64 card p-2"
                    >
                      <div className="px-3 py-2 border-b border-ink-100 mb-1">
                        <p className="font-bold text-ink-900 text-sm">{lang === 'ar' ? user.nameAr : user.name}</p>
                        <p className="text-xs text-ink-500">{t(user.role === 'student' ? 'role.student' : 'role.teacher')} <DemoTag /></p>
                      </div>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate(`${base}/profile`); }} icon={UserIcon} label={t('nav.profile')} />
                      <MenuItem onClick={() => { setMenuOpen(false); window.location.href = `mailto:${BRAND.supportEmail}`; }} icon={LifeBuoy} label={t('nav.support')} />
                      <MenuItem onClick={() => { setMenuOpen(false); setResetOpen(true); }} icon={RotateCcw} label={t('demo.reset')} />
                      <div className="border-t border-ink-100 mt-1 pt-1">
                        <MenuItem
                          onClick={() => { setMenuOpen(false); signOut(); navigate('/'); }}
                          icon={LogOut}
                          label={t('common.signOut')}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-10">{children}</main>

      {/* mobile bottom nav */}
      <nav aria-label={t('nav.menu')} className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink-100 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-brand-700' : 'text-ink-400'
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* demo reset confirm */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title={t('demo.reset.confirm.title')}>
        <p className="text-sm text-ink-600 mb-5">{t('demo.reset.confirm.body')}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setResetOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="danger"
            onClick={() => {
              resetDemoData();
              signOut();
              window.location.href = '/';
            }}
          >
            {t('demo.reset.confirm.yes')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function resolveParams(params: Record<string, string> | undefined, t: (k: TKey, p?: Record<string, string | number>) => string) {
  if (!params) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    // subject ids get translated to subject names when possible
    out[k] = k === 'subject' ? subjectName(v, t) : v;
  }
  return out;
}

import { getSubject } from '../lib/subjects';
function subjectName(id: string, _t: (k: TKey, p?: Record<string, string | number>) => string): string {
  const s = getSubject(id);
  if (!s) return id;
  // crude but effective: use current document language
  return document.documentElement.lang === 'ar' ? s.nameAr : s.nameEn;
}

function MenuItem({ onClick, icon: Icon, label }: { onClick: () => void; icon: typeof UserIcon; label: string }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors">
      <Icon className="h-4 w-4 text-ink-400" aria-hidden />
      {label}
    </button>
  );
}
