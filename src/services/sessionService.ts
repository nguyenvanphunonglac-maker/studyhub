import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Session, SessionAnswer, ParticipantRecord } from "@/types/session";
import { QuizSet } from "@/services/quizService";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateSessionCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function validateTimeLimit(n: number): boolean {
  return n >= 5 && n <= 180;
}

export function calculateScore(answers: SessionAnswer[]): number {
  return answers.filter((a) => a.isCorrect).length;
}

export function formatProgress(currentQuestionIndex: number, total: number): string {
  return `${currentQuestionIndex}/${total}`;
}

export function shouldShowWarning(participant: ParticipantRecord): boolean {
  return participant.tabLeftCount > 3;
}

export function sortLeaderboard(participants: ParticipantRecord[]): ParticipantRecord[] {
  return [...participants].sort((a, b) => {
    const scoreA = a.score ?? 0;
    const scoreB = b.score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const timeA = a.submittedAt ? a.submittedAt.toMillis() : Infinity;
    const timeB = b.submittedAt ? b.submittedAt.toMillis() : Infinity;
    return timeA - timeB;
  });
}

export function isSessionExpired(session: Session): boolean {
  return session.expiresAt.toMillis() < Date.now();
}

// ─── Error helpers ────────────────────────────────────────────────────────────

export class SessionError extends Error {
  constructor(public code: "UNAUTHORIZED" | "INVALID_STATE" | "NOT_FOUND" | "EXPIRED", message: string) {
    super(message);
    this.name = "SessionError";
  }
}

const SESSIONS = "quiz_sessions";
const participants = (sessionId: string) => collection(db, SESSIONS, sessionId, "participants");

// ─── 4.1 createSession ────────────────────────────────────────────────────────

export async function createSession(
  hostId: string,
  quizSet: QuizSet,
  timeLimitMinutes?: number
): Promise<string> {
  const createdAt = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(createdAt.toMillis() + 24 * 60 * 60 * 1000);
  const sessionCode = generateSessionCode();

  const data: Omit<Session, "sessionId"> = {
    sessionCode,
    hostId,
    hostName: quizSet.authorName ?? "Host",
    quizSetId: quizSet.id ?? "",
    questions: quizSet.questions,
    status: "waiting",
    createdAt,
    expiresAt,
    ...(timeLimitMinutes !== undefined ? { timeLimitMinutes } : {}),
  };

  const docRef = await addDoc(collection(db, SESSIONS), data);
  // Write sessionId into the document for convenience
  await updateDoc(docRef, { sessionId: docRef.id });
  return docRef.id;
}

// ─── 4.3 joinSession ─────────────────────────────────────────────────────────

export async function joinSession(
  sessionCode: string,
  userId: string,
  displayName: string
): Promise<string> {
  const q = query(
    collection(db, SESSIONS),
    where("sessionCode", "==", sessionCode),
    where("status", "in", ["waiting", "active"])
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new SessionError("NOT_FOUND", "Mã phòng không hợp lệ hoặc đã hết hạn");
  }

  const sessionDoc = snapshot.docs[0];
  const session = { sessionId: sessionDoc.id, ...sessionDoc.data() } as Session;

  if (isSessionExpired(session)) {
    throw new SessionError("EXPIRED", "Phiên thi đã hết hạn");
  }

  if (session.status === "active") {
    // Check idempotency first — if user already joined, let them back in
    const existingRef = doc(participants(session.sessionId), userId);
    const existingSnap = await getDoc(existingRef);
    if (existingSnap.exists()) {
      return session.sessionId;
    }
    throw new SessionError("INVALID_STATE", "Phiên thi đang diễn ra, không thể tham gia");
  }

  // Check idempotency for waiting state
  const existingRef = doc(participants(session.sessionId), userId);
  const existingSnap = await getDoc(existingRef);
  if (existingSnap.exists()) {
    return session.sessionId;
  }

  const record: ParticipantRecord = {
    userId,
    displayName,
    status: "joined",
    currentQuestionIndex: 0,
    answers: [],
    totalQuestions: session.questions.length,
    tabLeftCount: 0,
    isTabActive: true,
    joinedAt: Timestamp.now(),
  };

  await setDoc(existingRef, record);
  return session.sessionId;
}

// ─── 4.6 startSession ────────────────────────────────────────────────────────

export async function startSession(sessionId: string, hostId: string): Promise<void> {
  const sessionRef = doc(db, SESSIONS, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    throw new SessionError("NOT_FOUND", "Phiên thi không tồn tại");
  }

  const session = sessionSnap.data() as Session;

  if (session.hostId !== hostId) {
    throw new SessionError("UNAUTHORIZED", "Chỉ host mới có thể bắt đầu phiên thi");
  }

  if (session.status !== "waiting") {
    throw new SessionError("INVALID_STATE", "Phiên thi không ở trạng thái chờ");
  }

  await updateDoc(sessionRef, { status: "active", startedAt: Timestamp.now() });
}

// ─── 4.8 endSession ──────────────────────────────────────────────────────────

export async function endSession(sessionId: string, hostId: string): Promise<void> {
  const sessionRef = doc(db, SESSIONS, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    throw new SessionError("NOT_FOUND", "Phiên thi không tồn tại");
  }

  const session = sessionSnap.data() as Session;

  if (session.hostId !== hostId) {
    throw new SessionError("UNAUTHORIZED", "Chỉ host mới có thể kết thúc phiên thi");
  }

  if (session.status !== "active") {
    throw new SessionError("INVALID_STATE", "Phiên thi không ở trạng thái đang diễn ra");
  }

  await updateDoc(sessionRef, { status: "finished", endedAt: Timestamp.now() });
}

// ─── 4.11 updateProgress ─────────────────────────────────────────────────────

export async function updateProgress(
  sessionId: string,
  userId: string,
  currentQuestionIndex: number
): Promise<void> {
  const participantRef = doc(participants(sessionId), userId);
  await updateDoc(participantRef, { currentQuestionIndex });
}

// ─── 4.12 submitAnswers ───────────────────────────────────────────────────────

export async function submitAnswers(
  sessionId: string,
  userId: string,
  answers: SessionAnswer[]
): Promise<void> {
  const score = calculateScore(answers);
  const participantRef = doc(participants(sessionId), userId);
  await updateDoc(participantRef, {
    status: "submitted",
    score,
    answers,
    submittedAt: Timestamp.now(),
  });
}

// ─── 4.14 subscribeToSession & subscribeToParticipants ───────────────────────

export function subscribeToSession(
  sessionId: string,
  callback: (session: Session | null) => void
): Unsubscribe {
  const sessionRef = doc(db, SESSIONS, sessionId);
  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) {
      callback({ sessionId: snap.id, ...snap.data() } as Session);
    } else {
      callback(null);
    }
  });
}

export function subscribeToParticipants(
  sessionId: string,
  callback: (participants: ParticipantRecord[]) => void
): Unsubscribe {
  const participantsRef = collection(db, SESSIONS, sessionId, "participants");
  return onSnapshot(participantsRef, (snap) => {
    const records = snap.docs.map((d) => d.data() as ParticipantRecord);
    callback(records);
  });
}
