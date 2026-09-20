import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Hand, MessageSquare,
  PhoneOff, Send, PenLine, Flag, X,
} from 'lucide-react';
import { Button, Modal, Avatar, DemoTag } from '../../components/ui';
import { ReportModal } from '../../components/ReportModal';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDB } from '../../lib/db';
import { startSession, completeSession, sendChatMessage } from '../../lib/api';
import { formatDurationClock, formatSAR, formatTime } from '../../lib/format';
import { getSubject } from '../../lib/subjects';

export default function SessionRoom() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const db = useDB();
  const navigate = useNavigate();

  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [endOpen, setEndOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const session = db.sessions.find((s) => s.id === id);

  // timer tick
  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // completed elsewhere → go to summary
  useEffect(() => {
    if (session?.status === 'completed') navigate(`/session/${session.id}/complete`, { replace: true });
  }, [session?.status, session?.id, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.chat.length]);

  if (!user || !session) {
    return null;
  }
  // only the two participants may enter
  if (session.studentId !== user.id && session.teacherId !== user.id) {
    navigate('/', { replace: true });
    return null;
  }

  const isStudent = user.id === session.studentId;
  const me = user;
  const other = db.users.find((u) => u.id === (isStudent ? session.teacherId : session.studentId));
  const subject = getSubject(session.subjectId);
  const elapsed = session.startedAt ? Date.now() - session.startedAt : 0;
  const name = (u?: { name: string; nameAr: string }) => (u ? (lang === 'ar' ? u.nameAr : u.name) : '');

  if (session.status === 'cancelled') {
    return (
      <div className="min-h-dvh grid place-items-center bg-ink-950 text-white px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">{t('ses.cancelled.title')}</h1>
          <Button onClick={() => navigate(isStudent ? '/student' : '/teacher')}>{t('done.backHome')}</Button>
        </div>
      </div>
    );
  }

  const raiseHand = async () => {
    await sendChatMessage(session.id, me.id, '✋');
    toast(t('ses.handUp', { name: t('common.you') }), 'info');
  };

  const doEnd = async () => {
    setBusy(true);
    try {
      await completeSession(session.id);
      navigate(`/session/${session.id}/complete`);
    } catch {
      toast(t('err.generic'), 'error');
      setBusy(false);
    }
  };

  const sendMsg = async () => {
    if (!chatText.trim()) return;
    await sendChatMessage(session.id, me.id, chatText);
    setChatText('');
  };

  return (
    <div className="min-h-dvh bg-ink-950 text-white flex flex-col">
      {/* header */}
      <header className="flex items-center justify-between gap-3 px-4 md:px-6 h-14 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-bold truncate">{subject ? (lang === 'ar' ? subject.nameAr : subject.nameEn) : ''} · {session.topic}</span>
          <DemoTag />
        </div>
        <div className="flex items-center gap-3">
          {session.status === 'live' && (
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-mono font-bold" role="timer" aria-label={t('done.duration')}>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
              {formatDurationClock(elapsed)}
            </span>
          )}
          <button onClick={() => setReportOpen(true)} aria-label={t('ses.report')} className="grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <Flag className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* main area */}
        <main className="flex-1 flex flex-col p-4 md:p-6 gap-4 min-w-0">
          <p className="text-center text-xs text-white/40">{t('ses.demoRoom')}</p>

          {session.status === 'upcoming' ? (
            <div className="flex-1 grid place-items-center">
              <div className="text-center">
                <div className="flex justify-center -space-x-3 rtl:space-x-reverse mb-5">
                  <Avatar name={name(me)} hue={me.avatarHue} size={72} className="ring-4 ring-ink-950" />
                  {other && <Avatar name={name(other)} hue={other.avatarHue} size={72} className="ring-4 ring-ink-950" />}
                </div>
                <p className="text-lg font-bold mb-1">{t('ses.notStarted')}</p>
                <p className="text-white/50 text-sm mb-6">{other ? t('ses.waitingOther', { name: name(other) }) : ''}</p>
                <Button size="lg" onClick={() => startSession(session.id)}>{t('ses.start')}</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-rows-[1fr_auto] gap-4 min-h-0">
              {/* video tiles */}
              <div className={`grid gap-4 min-h-0 ${sharing ? 'grid-cols-1 md:grid-cols-[1fr_220px] md:grid-rows-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                {sharing && (
                  <div className="relative rounded-2xl bg-ink-900 border border-white/10 md:row-span-2 grid place-items-center overflow-hidden">
                    <div className="text-center text-white/40">
                      <MonitorUp className="h-10 w-10 mx-auto mb-2" aria-hidden />
                      <p className="text-sm font-semibold">{t('ses.sharing')}</p>
                    </div>
                  </div>
                )}
                <VideoTile userName={name(other)} hue={other?.avatarHue ?? 200} label={name(other)} camOn />
                <VideoTile userName={name(me)} hue={me.avatarHue} label={`${name(me)} (${t('common.you')})`} camOn={cam} muted={!mic} />
              </div>

              {/* whiteboard strip */}
              <div className="hidden md:flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-3.5 text-white/40">
                <PenLine className="h-5 w-5 shrink-0" aria-hidden />
                <p className="text-sm">{t('ses.whiteboard.demo')}</p>
              </div>
            </div>
          )}

          {/* controls */}
          <div className="flex items-center justify-center gap-2.5 md:gap-3 flex-wrap">
            <ControlBtn
              on={mic} onClick={() => setMic((m) => !m)}
              label={mic ? t('ses.mic') : t('ses.micOff')}
              iconOn={<Mic className="h-5 w-5" aria-hidden />} iconOff={<MicOff className="h-5 w-5" aria-hidden />}
            />
            <ControlBtn
              on={cam} onClick={() => setCam((c) => !c)}
              label={cam ? t('ses.cam') : t('ses.camOff')}
              iconOn={<Video className="h-5 w-5" aria-hidden />} iconOff={<VideoOff className="h-5 w-5" aria-hidden />}
            />
            <ControlBtn
              on={sharing} activeStyle onClick={() => setSharing((s) => !s)}
              label={t('ses.share')}
              iconOn={<MonitorUp className="h-5 w-5" aria-hidden />} iconOff={<MonitorUp className="h-5 w-5" aria-hidden />}
            />
            <ControlBtn
              on={false} onClick={raiseHand}
              label={t('ses.hand')}
              iconOn={<Hand className="h-5 w-5" aria-hidden />} iconOff={<Hand className="h-5 w-5" aria-hidden />}
            />
            <ControlBtn
              on={chatOpen} activeStyle onClick={() => setChatOpen((c) => !c)}
              label={t('ses.chat')}
              iconOn={<MessageSquare className="h-5 w-5" aria-hidden />} iconOff={<MessageSquare className="h-5 w-5" aria-hidden />}
            />
            {session.status === 'live' && (
              <button
                onClick={() => setEndOpen(true)}
                className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-5 py-3 font-bold text-sm transition-colors"
              >
                <PhoneOff className="h-5 w-5" aria-hidden />
                {t('ses.end')}
              </button>
            )}
          </div>
        </main>

        {/* chat panel */}
        {chatOpen && (
          <motion.aside
            initial={{ x: lang === 'ar' ? -320 : 320 }} animate={{ x: 0 }}
            className="w-80 shrink-0 border-s border-white/10 bg-ink-900 flex flex-col fixed inset-y-0 end-0 z-50 md:static"
            aria-label={t('ses.chat')}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
              <p className="font-bold">{t('ses.chat')}</p>
              <button onClick={() => setChatOpen(false)} aria-label={t('common.close')} className="text-white/50 hover:text-white">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {session.chat.map((m) => {
                const mine = m.senderId === me.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-brand-600 text-white' : 'bg-white/10 text-white/90'}`}>
                      {m.text}
                      <span className="block text-[10px] opacity-50 mt-0.5">{formatTime(m.at, lang)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form
              className="p-3 border-t border-white/10 flex gap-2"
              onSubmit={(e) => { e.preventDefault(); sendMsg(); }}
            >
              <label htmlFor="chat-input" className="sr-only">{t('ses.chat.ph')}</label>
              <input
                id="chat-input"
                className="flex-1 rounded-xl bg-white/10 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t('ses.chat.ph')}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                maxLength={500}
              />
              <button type="submit" aria-label={t('ses.chat.send')} className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors">
                <Send className="h-4.5 w-4.5 h-[18px] w-[18px] rtl:-scale-x-100" aria-hidden />
              </button>
            </form>
          </motion.aside>
        )}
      </div>

      {/* end confirm */}
      <Modal open={endOpen} onClose={() => setEndOpen(false)} title={t('ses.end.title')}>
        <p className="text-sm text-ink-600 mb-5">{t('ses.end.body', { price: formatSAR(session.price, lang) })}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEndOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="danger" loading={busy} onClick={doEnd}>{t('ses.end.confirm')}</Button>
        </div>
      </Modal>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reporterId={me.id}
        targetUserId={other?.id}
        sessionId={session.id}
      />
    </div>
  );
}

function VideoTile({ userName, hue, label, camOn, muted }: { userName: string; hue: number; label: string; camOn?: boolean; muted?: boolean }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 min-h-40 grid place-items-center"
      style={{ background: `radial-gradient(ellipse at 50% 30%, hsl(${hue} 30% 22%), hsl(${hue} 25% 10%))` }}
    >
      {camOn ? (
        <Avatar name={userName} hue={hue} size={84} />
      ) : (
        <VideoOff className="h-10 w-10 text-white/30" aria-hidden />
      )}
      <span className="absolute bottom-3 start-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-semibold">
        {muted && <MicOff className="h-3.5 w-3.5 text-red-400" aria-hidden />}
        {label}
      </span>
    </div>
  );
}

function ControlBtn({ on, onClick, label, iconOn, iconOff, activeStyle }: {
  on: boolean; onClick: () => void; label: string;
  iconOn: React.ReactNode; iconOff: React.ReactNode; activeStyle?: boolean;
}) {
  const cls = activeStyle
    ? on ? 'bg-brand-600 hover:bg-brand-700' : 'bg-white/10 hover:bg-white/20'
    : on ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/90 hover:bg-red-600';
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={`grid h-12 w-12 place-items-center rounded-full transition-colors ${cls}`}
    >
      {on ? iconOn : iconOff}
    </button>
  );
}
