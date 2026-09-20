export type Role = 'student' | 'teacher';
export type Level = 'primary' | 'intermediate' | 'secondary';
export type SessionDuration = 30 | 45 | 60 | 90;
export type Lang = 'en' | 'ar';

export interface User {
  id: string;
  role: Role;
  name: string;
  nameAr: string;
  email: string;
  /** hue used for the generated avatar (no real photos in the demo) */
  avatarHue: number;
  createdAt: number;
  isDemoSeed: boolean;
}

export interface StudentProfile {
  userId: string;
  level: Level;
  grade: number;
  preferredSubjects: string[];
  rating: number;
  ratingCount: number;
  walletBalance: number; // SAR
}

export interface TeacherProfile {
  userId: string;
  subjects: string[]; // subject ids
  levels: Level[];
  bio: string;
  bioAr: string;
  yearsExperience: number;
  languages: ('ar' | 'en')[];
  rating: number;
  ratingCount: number;
  completedSessions: number;
  /** Demo-only sample status — does NOT represent real identity verification */
  demoVerified: boolean;
  online: boolean;
  totalEarnings: number; // SAR, gross demo earnings
}

export interface Subject {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string; // lucide icon name key
  levels: Level[];
}

export type RequestStatus = 'searching' | 'accepted' | 'cancelled' | 'expired';

export interface TutoringRequest {
  id: string;
  studentId: string;
  subjectId: string;
  level: Level;
  grade: number;
  topic: string;
  description: string;
  duration: SessionDuration;
  price: number;
  status: RequestStatus;
  createdAt: number;
  acceptedBy?: string; // teacherId
  acceptedAt?: number;
}

export type SessionStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  at: number;
}

export interface RatingEntry {
  stars: number;
  feedback?: string;
  at: number;
}

export interface Session {
  id: string;
  requestId: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  level: Level;
  grade: number;
  topic: string;
  duration: SessionDuration;
  price: number; // gross, SAR
  teacherNet: number; // after configurable demo commission
  status: SessionStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  ratingByStudent?: RatingEntry;
  ratingByTeacher?: RatingEntry;
  chat: ChatMessage[];
  isDemoSeed?: boolean;
}

export type TransactionType = 'topup' | 'session_payment' | 'refund' | 'earning';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive = credit, negative = debit (SAR)
  noteKey: string; // i18n key
  noteParams?: Record<string, string>;
  sessionId?: string;
  createdAt: number;
  status: 'completed' | 'pending';
}

export interface AppNotification {
  id: string;
  userId: string;
  key: string; // i18n key
  params?: Record<string, string>;
  createdAt: number;
  read: boolean;
  href?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetUserId?: string;
  sessionId?: string;
  reason: string;
  details: string;
  createdAt: number;
  status: 'received';
}

export interface DB {
  version: number;
  users: User[];
  studentProfiles: StudentProfile[];
  teacherProfiles: TeacherProfile[];
  requests: TutoringRequest[];
  sessions: Session[];
  transactions: Transaction[];
  notifications: AppNotification[];
  reports: Report[];
}
