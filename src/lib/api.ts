import { getDB, mutate, setCurrentUserId } from './db';
import { uid } from './ids';
import { sessionPrice, teacherNet } from '../config/pricing';
import type {
  AppNotification, ChatMessage, Level, RatingEntry, Role, Session,
  SessionDuration, StudentProfile, TeacherProfile, Transaction,
  TutoringRequest, User,
} from './types';

/**
 * DEMO service layer. Simulates a backend API with small latencies.
 * Replace the internals with real HTTP calls in production — signatures
 * are designed to survive that migration.
 */

const delay = (ms = 450) => new Promise<void>((r) => setTimeout(r, ms + Math.random() * 250));

export class ApiError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
  }
}

function pushNotification(db: ReturnType<typeof getDB>, userId: string, key: string, params?: Record<string, string>, href?: string) {
  const n: AppNotification = { id: uid('ntf-'), userId, key, params, createdAt: Date.now(), read: false, href };
  db.notifications.unshift(n);
}

// ---------------- auth ----------------

export async function signInDemo(role: Role): Promise<User> {
  await delay(350);
  const db = getDB();
  const user = db.users.find((u) => u.id === (role === 'student' ? 'stu-demo' : 'tch-ahmed'));
  if (!user) throw new ApiError('user_not_found');
  setCurrentUserId(user.id);
  return user;
}

export async function signInEmail(email: string, _password: string): Promise<User> {
  await delay();
  const db = getDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new ApiError('invalid_credentials');
  // DEMO: any password is accepted for seeded demo accounts.
  setCurrentUserId(user.id);
  return user;
}

export interface RegisterInput {
  role: Role;
  name: string;
  email: string;
  level?: Level;
  grade?: number;
  subjects?: string[];
}

export async function register(input: RegisterInput): Promise<User> {
  await delay(600);
  const emailTaken = getDB().users.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (emailTaken) throw new ApiError('email_taken');
  const user: User = {
    id: uid(input.role === 'student' ? 'stu-' : 'tch-'),
    role: input.role,
    name: input.name,
    nameAr: input.name,
    email: input.email,
    avatarHue: Math.floor(Math.random() * 360),
    createdAt: Date.now(),
    isDemoSeed: false,
  };
  mutate((db) => {
    db.users.push(user);
    if (input.role === 'student') {
      db.studentProfiles.push({
        userId: user.id,
        level: input.level ?? 'secondary',
        grade: input.grade ?? 1,
        preferredSubjects: input.subjects ?? [],
        rating: 0,
        ratingCount: 0,
        walletBalance: 0,
      });
      pushNotification(db, user.id, 'notif.welcome');
    } else {
      db.teacherProfiles.push({
        userId: user.id,
        subjects: input.subjects ?? [],
        levels: ['primary', 'intermediate', 'secondary'],
        bio: '',
        bioAr: '',
        yearsExperience: 0,
        languages: ['ar'],
        rating: 0,
        ratingCount: 0,
        completedSessions: 0,
        demoVerified: false,
        online: false,
        totalEarnings: 0,
      });
      pushNotification(db, user.id, 'notif.welcomeTeacher');
    }
  });
  setCurrentUserId(user.id);
  return user;
}

export function signOut(): void {
  setCurrentUserId(null);
}

// ---------------- selectors (sync, cheap) ----------------

export function getUser(id: string): User | undefined {
  return getDB().users.find((u) => u.id === id);
}
export function getStudentProfile(userId: string): StudentProfile | undefined {
  return getDB().studentProfiles.find((p) => p.userId === userId);
}
export function getTeacherProfile(userId: string): TeacherProfile | undefined {
  return getDB().teacherProfiles.find((p) => p.userId === userId);
}

// ---------------- wallet ----------------

export async function topUpWallet(userId: string, amount: number): Promise<void> {
  await delay(900); // simulated payment processing
  if (amount <= 0 || amount > 5000) throw new ApiError('invalid_amount');
  mutate((db) => {
    const p = db.studentProfiles.find((s) => s.userId === userId);
    if (!p) throw new ApiError('profile_not_found');
    p.walletBalance += amount;
    const tx: Transaction = {
      id: uid('tx-'), userId, type: 'topup', amount, noteKey: 'tx.topup',
      createdAt: Date.now(), status: 'completed',
    };
    db.transactions.unshift(tx);
  });
}

// ---------------- requests / matching ----------------

export interface CreateRequestInput {
  studentId: string;
  subjectId: string;
  level: Level;
  grade: number;
  topic: string;
  description: string;
  duration: SessionDuration;
}

export async function createRequest(input: CreateRequestInput): Promise<TutoringRequest> {
  await delay();
  const price = sessionPrice(input.level, input.duration);
  const profile = getStudentProfile(input.studentId);
  if (!profile) throw new ApiError('profile_not_found');
  if (profile.walletBalance < price) throw new ApiError('insufficient_balance');
  const req: TutoringRequest = {
    id: uid('req-'),
    ...input,
    price,
    status: 'searching',
    createdAt: Date.now(),
  };
  mutate((db) => {
    db.requests.unshift(req);
    // notify online, qualified teachers
    db.teacherProfiles
      .filter((t) => t.online && t.subjects.includes(input.subjectId) && t.levels.includes(input.level))
      .forEach((t) => pushNotification(db, t.userId, 'notif.newRequest', { subject: input.subjectId }, '/teacher'));
  });
  return req;
}

export async function cancelRequest(requestId: string): Promise<{ refunded: boolean }> {
  await delay(300);
  let refunded = false;
  mutate((db) => {
    const req = db.requests.find((r) => r.id === requestId);
    if (!req) throw new ApiError('request_not_found');
    if (req.status === 'accepted') {
      // cancel after acceptance → cancel the session too, full wallet refund (demo rule)
      const ses = db.sessions.find((s) => s.requestId === requestId && s.status === 'upcoming');
      if (ses) {
        ses.status = 'cancelled';
        pushNotification(db, ses.teacherId, 'notif.sessionCancelled', { subject: req.subjectId });
      }
      req.status = 'cancelled';
      refunded = false; // payment is only taken at completion in the demo, so nothing to refund
    } else if (req.status === 'searching') {
      req.status = 'cancelled';
    }
  });
  return { refunded };
}

/**
 * FIRST-ACCEPT: compare-and-set against fresh storage. If another teacher
 * accepted first, this throws `already_taken` and the caller shows the
 * "request no longer available" state.
 */
export async function acceptRequest(requestId: string, teacherId: string): Promise<Session> {
  await delay(500);
  let created: Session | null = null;
  mutate((db) => {
    const req = db.requests.find((r) => r.id === requestId);
    if (!req) throw new ApiError('request_not_found');
    if (req.status === 'cancelled') throw new ApiError('request_cancelled');
    if (req.status !== 'searching') throw new ApiError('already_taken');
    req.status = 'accepted';
    req.acceptedBy = teacherId;
    req.acceptedAt = Date.now();
    const ses: Session = {
      id: uid('ses-'),
      requestId: req.id,
      studentId: req.studentId,
      teacherId,
      subjectId: req.subjectId,
      level: req.level,
      grade: req.grade,
      topic: req.topic,
      duration: req.duration,
      price: req.price,
      teacherNet: teacherNet(req.price),
      status: 'upcoming',
      createdAt: Date.now(),
      chat: [],
    };
    db.sessions.unshift(ses);
    created = ses;
    pushNotification(db, req.studentId, 'notif.teacherAccepted', { subject: req.subjectId }, `/session/${ses.id}`);
    pushNotification(db, teacherId, 'notif.youAccepted', { subject: req.subjectId }, `/session/${ses.id}`);
  });
  return created!;
}

/** Demo-only helper: the seeded demo teacher accepts the request (used from
 *  the matching screen when no second tab is open). Clearly labeled in UI. */
export async function simulateDemoAccept(requestId: string): Promise<Session> {
  await delay(1400);
  const req = getDB().requests.find((r) => r.id === requestId);
  if (!req) throw new ApiError('request_not_found');
  // pick a qualified seeded teacher, prefer the demo teacher
  const teachers = getDB().teacherProfiles.filter(
    (t) => t.subjects.includes(req.subjectId) && t.levels.includes(req.level),
  );
  const pick = teachers.find((t) => t.userId === 'tch-ahmed') ?? teachers[0];
  if (!pick) throw new ApiError('no_teachers');
  return acceptRequest(requestId, pick.userId);
}

// ---------------- teacher availability ----------------

export async function setTeacherOnline(teacherId: string, online: boolean): Promise<void> {
  await delay(250);
  mutate((db) => {
    const t = db.teacherProfiles.find((p) => p.userId === teacherId);
    if (t) t.online = online;
  });
}

/** Requests currently visible to a given teacher (qualified + searching). */
export function openRequestsFor(teacherId: string): TutoringRequest[] {
  const db = getDB();
  const t = db.teacherProfiles.find((p) => p.userId === teacherId);
  if (!t || !t.online) return [];
  return db.requests.filter(
    (r) => r.status === 'searching' && t.subjects.includes(r.subjectId) && t.levels.includes(r.level),
  );
}

// ---------------- session lifecycle ----------------

export async function startSession(sessionId: string): Promise<void> {
  await delay(300);
  mutate((db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    if (!s) throw new ApiError('session_not_found');
    if (s.status === 'upcoming') {
      s.status = 'live';
      s.startedAt = Date.now();
    }
  });
}

export async function sendChatMessage(sessionId: string, senderId: string, text: string): Promise<void> {
  const clean = text.trim().slice(0, 500);
  if (!clean) return;
  mutate((db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    if (!s) throw new ApiError('session_not_found');
    const msg: ChatMessage = { id: uid('msg-'), senderId, text: clean, at: Date.now() };
    s.chat.push(msg);
  });
}

/**
 * Completes the session: deducts the student wallet, credits teacher demo
 * earnings, writes both transactions, updates counters and notifies both.
 * Idempotent — a second call (e.g. both tabs ending) is a no-op.
 */
export async function completeSession(sessionId: string): Promise<Session> {
  await delay(600);
  let result: Session | null = null;
  mutate((db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    if (!s) throw new ApiError('session_not_found');
    if (s.status === 'completed') { result = s; return; }
    if (s.status !== 'live' && s.status !== 'upcoming') throw new ApiError('invalid_state');
    s.status = 'completed';
    s.endedAt = Date.now();

    const student = db.studentProfiles.find((p) => p.userId === s.studentId);
    const teacher = db.teacherProfiles.find((p) => p.userId === s.teacherId);
    if (student) student.walletBalance = Math.max(0, student.walletBalance - s.price);
    if (teacher) {
      teacher.totalEarnings += s.teacherNet;
      teacher.completedSessions += 1;
    }
    db.transactions.unshift({
      id: uid('tx-'), userId: s.studentId, type: 'session_payment', amount: -s.price,
      noteKey: 'tx.sessionPayment', noteParams: { subject: s.subjectId }, sessionId: s.id,
      createdAt: Date.now(), status: 'completed',
    });
    db.transactions.unshift({
      id: uid('tx-'), userId: s.teacherId, type: 'earning', amount: s.teacherNet,
      noteKey: 'tx.earning', noteParams: { subject: s.subjectId }, sessionId: s.id,
      createdAt: Date.now(), status: 'completed',
    });
    pushNotification(db, s.studentId, 'notif.sessionCompleted', { subject: s.subjectId }, `/session/${s.id}/complete`);
    pushNotification(db, s.teacherId, 'notif.earningsUpdated', { amount: String(s.teacherNet) }, `/session/${s.id}/complete`);
    result = s;
  });
  return result!;
}

export async function rateSession(sessionId: string, raterRole: Role, entry: RatingEntry): Promise<void> {
  await delay(400);
  mutate((db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    if (!s) throw new ApiError('session_not_found');
    if (raterRole === 'student') {
      if (s.ratingByStudent) return;
      s.ratingByStudent = entry;
      const t = db.teacherProfiles.find((p) => p.userId === s.teacherId);
      if (t) {
        t.rating = Math.round(((t.rating * t.ratingCount + entry.stars) / (t.ratingCount + 1)) * 10) / 10;
        t.ratingCount += 1;
      }
    } else {
      if (s.ratingByTeacher) return;
      s.ratingByTeacher = entry;
      const p = db.studentProfiles.find((x) => x.userId === s.studentId);
      if (p) {
        const base = p.ratingCount === 0 ? entry.stars : (p.rating * p.ratingCount + entry.stars) / (p.ratingCount + 1);
        p.rating = Math.round(base * 10) / 10;
        p.ratingCount += 1;
      }
    }
  });
}

// ---------------- notifications / reports ----------------

export function markNotificationsRead(userId: string): void {
  mutate((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  });
}

export async function submitReport(input: { reporterId: string; targetUserId?: string; sessionId?: string; reason: string; details: string }): Promise<void> {
  await delay(500);
  mutate((db) => {
    db.reports.unshift({ id: uid('rep-'), ...input, createdAt: Date.now(), status: 'received' });
    pushNotification(db, input.reporterId, 'notif.reportReceived');
  });
}
