import type { Lang } from './types';

/** SAR currency formatting, locale-aware. */
export function formatSAR(amount: number, lang: Lang): string {
  const n = new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(Math.abs(amount));
  const sign = amount < 0 ? '-' : '';
  return lang === 'ar' ? `${sign}${n} ر.س` : `${sign}${n} SAR`;
}

export function formatDate(ts: number, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(ts);
}

export function formatTime(ts: number, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    hour: 'numeric', minute: '2-digit',
  }).format(ts);
}

export function formatDateTime(ts: number, lang: Lang): string {
  return `${formatDate(ts, lang)} · ${formatTime(ts, lang)}`;
}

export function timeAgo(ts: number, lang: Lang): string {
  const diff = Date.now() - ts;
  const rtf = new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar' : 'en', { numeric: 'auto' });
  const min = Math.round(diff / 60000);
  if (min < 1) return lang === 'ar' ? 'الآن' : 'just now';
  if (min < 60) return rtf.format(-min, 'minute');
  const hrs = Math.round(min / 60);
  if (hrs < 24) return rtf.format(-hrs, 'hour');
  return rtf.format(-Math.round(hrs / 24), 'day');
}

export function formatDurationClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
