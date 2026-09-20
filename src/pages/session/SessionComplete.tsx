import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button, Avatar, StarInput } from '../../components/ui';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDB } from '../../lib/db';
import { rateSession } from '../../lib/api';
import { formatSAR } from '../../lib/format';
import { getSubject } from '../../lib/subjects';

export default function SessionComplete() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const db = useDB();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const session = db.sessions.find((s) => s.id === id);
  if (!user || !session) return null;
  if (session.studentId !== user.id && session.teacherId !== user.id) {
    navigate('/', { replace: true });
    return null;
  }

  const isStudent = user.id === session.studentId;
  const other = db.users.find((u) => u.id === (isStudent ? session.teacherId : session.studentId));
  const myRating = isStudent ? session.ratingByStudent : session.ratingByTeacher;
  const studentProfile = db.studentProfiles.find((p) => p.userId === session.studentId);
  const teacherProfile = db.teacherProfiles.find((p) => p.userId === session.teacherId);
  const subject = getSubject(session.subjectId);
  const home = isStudent ? '/student' : '/teacher';

  const submitRating = async () => {
    if (stars === 0) return;
    setBusy(true);
    try {
      await rateSession(session.id, isStudent ? 'student' : 'teacher', {
        stars, feedback: feedback.trim() || undefined, at: Date.now(),
      });
      toast(t('done.rate.thanks'));
    } catch {
      toast(t('err.generic'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700"
        >
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-ink-950 mb-1">{t('done.title')}</h1>
        <p className="text-ink-500">{t('done.sub')}</p>
      </motion.div>

      {/* summary */}
      <div className="card p-6 mb-6">
        <dl className="space-y-3 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('req.subject')}</dt>
            <dd className="font-semibold text-ink-900">{subject ? (lang === 'ar' ? subject.nameAr : subject.nameEn) : ''} · {session.topic}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">{t('done.duration')}</dt>
            <dd className="font-semibold text-ink-900">{session.duration} {t('common.minutes')}</dd>
          </div>
          {isStudent ? (
            <>
              <div className="flex justify-between">
                <dt className="text-ink-500">{t('done.charged')}</dt>
                <dd className="font-bold text-red-600">-{formatSAR(session.price, lang)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-3">
                <dt className="text-ink-500">{t('done.newBalance')}</dt>
                <dd className="font-extrabold text-ink-950 text-lg">{formatSAR(studentProfile?.walletBalance ?? 0, lang)}</dd>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <dt className="text-ink-500">{t('done.earned')}</dt>
                <dd className="font-bold text-brand-700">+{formatSAR(session.teacherNet, lang)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-3">
                <dt className="text-ink-500">{t('done.newTotal')}</dt>
                <dd className="font-extrabold text-ink-950 text-lg">{formatSAR(teacherProfile?.totalEarnings ?? 0, lang)}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* rating */}
      <div className="card p-6 text-center">
        {myRating ? (
          <div>
            <p className="font-bold text-ink-900 mb-2">{t('done.rate.thanks')}</p>
            <p className="text-sand-500 text-2xl mb-4" aria-label={`${myRating.stars} / 5`}>
              {'★'.repeat(myRating.stars)}{'☆'.repeat(5 - myRating.stars)}
            </p>
            <Button onClick={() => navigate(home)}>{t('done.backHome')}</Button>
          </div>
        ) : (
          <div>
            {other && (
              <div className="flex flex-col items-center mb-4">
                <Avatar name={lang === 'ar' ? other.nameAr : other.name} hue={other.avatarHue} size={64} className="mb-2" />
                <h2 className="font-bold text-lg text-ink-900">
                  {t(isStudent ? 'done.rate.student' : 'done.rate.teacher')}
                </h2>
                <p className="text-sm text-ink-500">{t('done.rate.sub')}</p>
              </div>
            )}
            <div className="flex justify-center mb-4">
              <StarInput value={stars} onChange={setStars} label={t(isStudent ? 'done.rate.student' : 'done.rate.teacher')} />
            </div>
            <label htmlFor="rate-feedback" className="sr-only">{t('done.feedback.ph')}</label>
            <textarea
              id="rate-feedback"
              className="input min-h-20 resize-y mb-4"
              placeholder={t('done.feedback.ph')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={400}
            />
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => navigate(home)}>{t('done.rate.skip')}</Button>
              <Button loading={busy} disabled={stars === 0} onClick={submitRating}>{t('done.rate.submit')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
