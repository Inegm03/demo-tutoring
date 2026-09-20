import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LanguageContext';
import { SessionHistoryList } from '../../components/SessionHistoryList';

export default function TeacherHistory() {
  const { user } = useAuth();
  const { t } = useLang();
  if (!user) return null;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-ink-950 mb-6">{t('his.title')}</h1>
      <SessionHistoryList viewerId={user.id} viewerRole="teacher" />
    </div>
  );
}
