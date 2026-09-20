import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarX2, Star } from 'lucide-react';
import { StatusChip, EmptyState, SubjectIcon, Avatar, Button } from './ui';
import { useLang } from '../i18n/LanguageContext';
import { useDB } from '../lib/db';
import { getSubject } from '../lib/subjects';
import { formatSAR, formatDateTime } from '../lib/format';
import type { Role, Session } from '../lib/types';

export function SessionHistoryList({ viewerId, viewerRole }: { viewerId: string; viewerRole: Role }) {
  const db = useDB();
  const { t } = useLang();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const mine = db.sessions
    .filter((s) => (viewerRole === 'student' ? s.studentId === viewerId : s.teacherId === viewerId))
    .filter((s) => (filter === 'all' ? true : s.status === filter))
    .sort((a, b) => b.createdAt - a.createdAt);

  const filters = [
    { id: 'all' as const, label: t('his.filter.all') },
    { id: 'completed' as const, label: t('his.filter.completed') },
    { id: 'cancelled' as const, label: t('his.filter.cancelled') },
  ];

  return (
    <div>
      <div role="tablist" aria-label={t('his.title')} className="flex gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.id ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {mine.length === 0 ? (
        <div className="card">
          <EmptyState icon={CalendarX2} title={t('his.empty')} sub={t('his.emptySub')} />
        </div>
      ) : (
        <ul className="space-y-3">
          {mine.map((s) => (
            <HistoryRow key={s.id} session={s} viewerRole={viewerRole} onRate={() => navigate(`/session/${s.id}/complete`)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryRow({ session: s, viewerRole, onRate }: { session: Session; viewerRole: Role; onRate: () => void }) {
  const db = useDB();
  const { t, lang } = useLang();
  const otherId = viewerRole === 'student' ? s.teacherId : s.studentId;
  const other = db.users.find((u) => u.id === otherId);
  const subject = getSubject(s.subjectId);
  const myRating = viewerRole === 'student' ? s.ratingByStudent : s.ratingByTeacher;
  const amount = viewerRole === 'student' ? -s.price : s.teacherNet;

  return (
    <li className="card p-5 flex flex-wrap items-center gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <SubjectIcon icon={subject?.icon ?? 'book-open'} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink-900 truncate">{s.topic}</p>
        <p className="text-sm text-ink-500 truncate">
          {subject ? (lang === 'ar' ? subject.nameAr : subject.nameEn) : ''} ·{' '}
          {other ? t('his.with', { name: lang === 'ar' ? other.nameAr : other.name }) : ''}
        </p>
        <p className="text-xs text-ink-400 mt-0.5">{formatDateTime(s.createdAt, lang)} · {s.duration} {t('common.min')}</p>
      </div>
      <div className="flex items-center gap-3 ms-auto">
        {other && <Avatar name={lang === 'ar' ? other.nameAr : other.name} hue={other.avatarHue} size={36} className="hidden sm:inline-grid" />}
        <div className="text-end">
          {s.status === 'completed' && (
            <p className={`font-extrabold ${amount >= 0 ? 'text-brand-700' : 'text-ink-900'}`}>
              {amount >= 0 ? '+' : ''}{formatSAR(amount, lang)}
            </p>
          )}
          <p className="text-xs text-ink-400">
            {s.status === 'completed'
              ? myRating ? t('his.rated', { stars: myRating.stars }) : t('his.notRated')
              : null}
          </p>
        </div>
        {s.status === 'completed' && !myRating && (
          <Button size="sm" variant="secondary" onClick={onRate}>
            <Star className="h-3.5 w-3.5" aria-hidden /> {t('stu.dash.rateNow')}
          </Button>
        )}
        <StatusChip status={s.status} />
      </div>
    </li>
  );
}
