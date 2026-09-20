import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sigma, BookOpen, Languages, Atom, FlaskConical, Dna, Microscope, Code2,
  Globe2, MoonStar, Star, X, Loader2, GraduationCap, type LucideIcon,
} from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import type { SessionStatus, RequestStatus } from '../lib/types';

// ---------- Logo ----------
export function Logo({ className = 'h-8' }: { className?: string }) {
  const { t } = useLang();
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-soft">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink-900">{t('app.name')}</span>
    </span>
  );
}

// ---------- Buttons ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
const variantCls: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-soft',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200',
  outline: 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100/70',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  full?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, full, className = '', children, disabled, ...rest }: BtnProps) {
  const sizeCls = size === 'lg' ? 'px-6 py-3.5 text-base rounded-xl' : size === 'sm' ? 'px-3 py-1.5 text-sm rounded-lg' : 'px-4.5 px-5 py-2.5 text-[15px] rounded-xl';
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${variantCls[variant]} ${sizeCls} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ---------- Avatar (generated — no real photos in the demo) ----------
export function Avatar({ name, hue, size = 44, className = '' }: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .map((w) => w.match(/\p{L}/u)?.[0])
    .filter((c): c is string => !!c)
    .slice(0, 2)
    .join('');
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 45% 45%), hsl(${(hue + 40) % 360} 50% 35%))`,
      }}
    >
      {initials}
    </span>
  );
}

// ---------- Stars ----------
export function Stars({ value, count, className = '' }: { value: number; count?: number; className?: string }) {
  const { lang } = useLang();
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`${value} / 5`}>
      <Star className="h-4 w-4 fill-sand-400 text-sand-400" aria-hidden />
      <span className="text-sm font-semibold text-ink-800">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-ink-400">({new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US').format(count)})</span>
      )}
    </span>
  );
}

export function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} / 5`}
          onClick={() => onChange(n)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star className={`h-9 w-9 transition-colors ${n <= value ? 'fill-sand-400 text-sand-400' : 'text-ink-200'}`} aria-hidden />
        </button>
      ))}
    </div>
  );
}

// ---------- Status chip ----------
const statusStyle: Record<SessionStatus | RequestStatus, string> = {
  upcoming: 'bg-sky-50 text-sky-700 border-sky-200',
  live: 'bg-brand-50 text-brand-700 border-brand-200',
  completed: 'bg-ink-50 text-ink-600 border-ink-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  searching: 'bg-sand-50 text-sand-700 border-sand-200',
  accepted: 'bg-brand-50 text-brand-700 border-brand-200',
  expired: 'bg-ink-50 text-ink-500 border-ink-200',
};

export function StatusChip({ status }: { status: SessionStatus | RequestStatus }) {
  const { t } = useLang();
  const key = (status === 'accepted' ? 'status.upcoming' : `status.${status}`) as Parameters<typeof t>[0];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle[status]}`}>
      {status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" aria-hidden />}
      {status === 'expired' ? t('status.cancelled') : t(key)}
    </span>
  );
}

export function DemoTag({ children }: { children?: ReactNode }) {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center rounded-md bg-sand-100 border border-sand-200 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sand-800">
      {children ?? t('common.demo')}
    </span>
  );
}

// ---------- Subject icon ----------
const subjectIcons: Record<string, LucideIcon> = {
  sigma: Sigma, 'book-open': BookOpen, languages: Languages, atom: Atom,
  flask: FlaskConical, dna: Dna, microscope: Microscope, code: Code2,
  globe: Globe2, 'moon-star': MoonStar,
};

export function SubjectIcon({ icon, className = 'h-5 w-5' }: { icon: string; className?: string }) {
  const Icon = subjectIcons[icon] ?? BookOpen;
  return <Icon className={className} aria-hidden />;
}

/**
 * Playful icon chip: the icon does a happy wiggle on hover/tap.
 * Uses framer-motion so it respects prefers-reduced-motion via the
 * global CSS reduced-motion override.
 */
export function FunIconChip({ icon, className = '', size = 'h-11 w-11' }: { icon: string; className?: string; size?: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.12, rotate: [0, -8, 8, -4, 0] }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.45 }}
      className={`grid ${size} place-items-center rounded-xl bg-brand-50 text-brand-700 ${className}`}
    >
      <SubjectIcon icon={icon} className="h-[22px] w-[22px]" />
    </motion.span>
  );
}

// ---------- Skeleton / Empty ----------
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function EmptyState({ icon: Icon, title, sub, action }: { icon: LucideIcon; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-300">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <p className="font-semibold text-ink-800 mt-1">{title}</p>
      {sub && <p className="text-sm text-ink-500 max-w-xs">{sub}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// ---------- Field ----------
export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert" id={`${htmlFor}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- Modal (accessible: focus, Esc, backdrop, aria) ----------
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl bg-white shadow-lift p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-ink-900">{title}</h2>
              <button onClick={onClose} aria-label={t('common.close')} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700 transition-colors">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
