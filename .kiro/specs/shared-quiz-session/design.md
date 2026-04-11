# Design Document: Shared Quiz Session

## Overview

Shared Quiz Session cho phép một Host tạo phòng thi trực tuyến từ một QuizSet có sẵn, chia sẻ mã phòng 6 ký tự để Participants tham gia, và theo dõi tiến độ làm bài theo thời gian thực. Sau khi phiên kết thúc, tất cả mọi người xem bảng xếp hạng chung.

Tính năng được xây dựng hoàn toàn trên Firebase Firestore (realtime với `onSnapshot`), tích hợp vào hệ thống QuizManager hiện có mà không thay đổi cấu trúc dữ liệu hiện tại.

### Luồng chính

```
Host tạo Session (waiting)
  → Participants tham gia bằng Session_Code
  → Host bắt đầu (active) → Participants làm bài
  → Host kết thúc hoặc hết giờ (finished) → Leaderboard
```

---

## Architecture

### Tổng quan kiến trúc

```mermaid
graph TD
    subgraph Client - Host
        HUI[HostSessionView]
        HDB[HostDashboard - progress monitor]
    end

    subgraph Client - Participant
        PUI[ParticipantSessionView]
        QA[QuizActive - làm bài]
        TM[TabMonitor hook]
    end

    subgraph Services
        SS[sessionService.ts]
        PT[progressTracker - trong sessionService]
    end

    subgraph Firebase
        FS[(Firestore)]
        FS_S[/quiz_sessions/{sessionId}/]
        FS_P[/quiz_sessions/{sessionId}/participants/{userId}/]
    end

    HUI --> SS
    PUI --> SS
    QA --> SS
    TM --> SS
    SS --> FS
    FS_S --> FS
    FS_P --> FS
    FS -->|onSnapshot| HDB
    FS -->|onSnapshot| PUI
```

### Nguyên tắc thiết kế

- **Tách biệt service**: Toàn bộ logic Firestore nằm trong `sessionService.ts` mới, không sửa `quizService.ts` hiện có.
- **Realtime qua onSnapshot**: Host dashboard và Participant view đều subscribe Firestore, không polling.
- **State machine rõ ràng**: Session chỉ chuyển trạng thái theo một chiều: `waiting → active → finished`.
- **Authorization tại service layer**: Kiểm tra `hostId` / `userId` trước khi ghi Firestore, bổ sung bằng Firestore Rules.

---

## Components and Interfaces

### Cây component

```
QuizManager (hiện có)
└── SharedSessionButton (nút "Tạo phòng thi chung" trên mỗi QuizSet card)

/session/[sessionId] (route mới - Next.js App Router)
├── HostSessionView       (nếu user === hostId)
│   ├── WaitingRoomHost   (status === waiting)
│   ├── HostDashboard     (status === active)
│   └── LeaderboardView   (status === finished)
└── ParticipantSessionView (nếu user !== hostId)
    ├── JoinSessionForm   (trang /join - nhập mã phòng)
    ├── WaitingRoomParticipant (status === waiting)
    ├── QuizActiveSession  (status === active - làm bài)
    └── LeaderboardView   (status === finished)
```

### Routes mới

| Route | Mô tả |
|---|---|
| `/join` | Trang nhập Session_Code để tham gia |
| `/session/[sessionId]` | Trang phiên thi (Host hoặc Participant tùy role) |

### sessionService.ts - Interface

```typescript
// Tạo session
createSession(hostId: string, quizSet: QuizSet, timeLimitMinutes?: number): Promise<string>

// Tham gia session
joinSession(sessionCode: string, userId: string, displayName: string): Promise<string> // returns sessionId

// Điều khiển session (chỉ host)
startSession(sessionId: string, hostId: string): Promise<void>
endSession(sessionId: string, hostId: string): Promise<void>

// Cập nhật tiến độ participant
updateProgress(sessionId: string, userId: string, currentQuestionIndex: number): Promise<void>

// Nộp bài
submitAnswers(sessionId: string, userId: string, answers: SessionAnswer[]): Promise<void>

// Realtime subscriptions
subscribeToSession(sessionId: string, callback: (session: Session) => void): Unsubscribe
subscribeToParticipants(sessionId: string, callback: (participants: ParticipantRecord[]) => void): Unsubscribe

// Tiện ích
generateSessionCode(): string
isSessionExpired(session: Session): boolean
```

### Hooks

```typescript
// useTabMonitor.ts
// Lắng nghe document.visibilityState, gọi sessionService khi tab ẩn/hiện
useTabMonitor(sessionId: string, userId: string, isActive: boolean): void

// useSessionTimer.ts  
// Đếm ngược thời gian còn lại, tự động submit khi hết giờ
useSessionTimer(session: Session, onExpire: () => void): { timeRemaining: number }
```

---

## Data Models

### Session document

**Path:** `quiz_sessions/{sessionId}`

```typescript
interface Session {
  sessionId: string;
  sessionCode: string;          // 6 ký tự uppercase alphanumeric
  hostId: string;
  hostName: string;
  quizSetId: string;
  questions: Question[];        // snapshot từ QuizSet tại thời điểm tạo
  status: 'waiting' | 'active' | 'finished';
  timeLimitMinutes?: number;    // optional, 5-180
  createdAt: Timestamp;
  expiresAt: Timestamp;         // createdAt + 24h
  startedAt?: Timestamp;
  endedAt?: Timestamp;
}
```

### ParticipantRecord document

**Path:** `quiz_sessions/{sessionId}/participants/{userId}`

```typescript
interface ParticipantRecord {
  userId: string;
  displayName: string;
  status: 'joined' | 'submitted' | 'auto_submitted';
  currentQuestionIndex: number;   // 0-based, cập nhật realtime
  answers: SessionAnswer[];       // chỉ có sau khi submit
  score?: number;
  totalQuestions: number;
  submittedAt?: Timestamp;
  tabLeftCount: number;           // số lần rời tab
  lastTabLeftAt?: Timestamp;
  isTabActive: boolean;
  joinedAt: Timestamp;
}

interface SessionAnswer {
  questionIndex: number;
  selectedOption: number;         // index 0-3
  isCorrect: boolean;
}
```

### Firestore Structure

```
quiz_sessions/                          (root collection)
  {sessionId}/                          (Session document)
    participants/                       (subcollection)
      {userId}/                         (ParticipantRecord document)
```

### Lookup index

Để tìm session bằng `sessionCode`, cần Firestore index hoặc query:
```typescript
query(collection(db, 'quiz_sessions'), 
  where('sessionCode', '==', code),
  where('status', 'in', ['waiting', 'active'])
)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Session_Code format

*For any* call to `generateSessionCode()`, the result SHALL be a string of exactly 6 characters, each being an uppercase letter (A-Z) or digit (0-9).

**Validates: Requirements 1.2**

---

### Property 2: Session TTL invariant

*For any* session created at timestamp `createdAt`, the `expiresAt` field SHALL equal `createdAt + 24 * 60 * 60 * 1000` milliseconds.

**Validates: Requirements 1.3**

---

### Property 3: Time limit validation

*For any* integer `n`, `validateTimeLimit(n)` SHALL return `true` if and only if `5 ≤ n ≤ 180`.

**Validates: Requirements 1.4**

---

### Property 4: Join initializes participant correctly

*For any* valid session code and authenticated user ID, calling `joinSession` SHALL create a `ParticipantRecord` with `status = 'joined'` and `currentQuestionIndex = 0`.

**Validates: Requirements 2.1**

---

### Property 5: Join idempotence (no duplicate records)

*For any* user who has already joined a session, calling `joinSession` again SHALL result in exactly one `ParticipantRecord` for that user — the existing record is restored, not duplicated.

**Validates: Requirements 2.4**

---

### Property 6: Active session rejects new joins

*For any* session with `status = 'active'`, any call to `joinSession` SHALL return an error and SHALL NOT create a new `ParticipantRecord`.

**Validates: Requirements 3.3**

---

### Property 7: State transition — start session

*For any* session with `status = 'waiting'`, calling `startSession` with the correct `hostId` SHALL result in `status = 'active'` and `startedAt` being set to a non-null timestamp.

**Validates: Requirements 3.1**

---

### Property 8: State transition — end session

*For any* session with `status = 'active'`, calling `endSession` with the correct `hostId` SHALL result in `status = 'finished'` and `endedAt` being set to a non-null timestamp.

**Validates: Requirements 3.2**

---

### Property 9: Host-only authorization

*For any* session and any `userId` that does NOT equal `session.hostId`, calling `startSession` or `endSession` SHALL return an authorization error and SHALL NOT modify the session.

**Validates: Requirements 8.3**

---

### Property 10: Score calculation correctness

*For any* list of `SessionAnswer[]`, `calculateScore(answers)` SHALL return exactly the count of answers where `isCorrect === true`.

**Validates: Requirements 6.1**

---

### Property 11: Submission stores all required fields

*For any* participant submission, the resulting `ParticipantRecord` SHALL contain `status = 'submitted'`, a non-null `score`, a non-null `submittedAt`, and an `answers` array with length equal to the number of questions answered.

**Validates: Requirements 4.3, 6.2**

---

### Property 12: Auto-submit on expiry

*For any* participant with `status = 'joined'` (not yet submitted) when the session timer expires, the system SHALL set their `status` to `'auto_submitted'` and calculate their score from current answers.

**Validates: Requirements 6.4**

---

### Property 13: Tab leave increments counter

*For any* participant with `tabLeftCount = n`, when a `visibilitychange` event fires with `document.visibilityState = 'hidden'`, the participant's `tabLeftCount` SHALL become `n + 1` and `lastTabLeftAt` SHALL be updated.

**Validates: Requirements 5.1, 5.2**

---

### Property 14: Tab return restores active state

*For any* participant, after a tab-leave event followed by a tab-return event, `isTabActive` SHALL be `true`.

**Validates: Requirements 5.3**

---

### Property 15: Warning threshold

*For any* participant record, `shouldShowWarning(participant)` SHALL return `true` if and only if `participant.tabLeftCount > 3`.

**Validates: Requirements 5.5**

---

### Property 16: Progress format

*For any* `currentQuestionIndex` in `[0, total]` and `total > 0`, `formatProgress(currentQuestionIndex, total)` SHALL return the string `"${currentQuestionIndex}/${total}"`.

**Validates: Requirements 4.2**

---

### Property 17: Leaderboard sort order

*For any* list of `ParticipantRecord[]`, `sortLeaderboard(participants)` SHALL return a list where for every adjacent pair `(a, b)`, either `a.score > b.score`, or `a.score === b.score && a.submittedAt ≤ b.submittedAt`.

**Validates: Requirements 7.1, 7.2**

---

### Property 18: Leaderboard top-3 highlight

*For any* leaderboard with `N` participants, the top `min(3, N)` entries SHALL have a highlight indicator, and all remaining entries SHALL NOT.

**Validates: Requirements 7.4**

---

### Property 19: Self-entry highlight

*For any* participant `P` viewing the leaderboard, the entry corresponding to `P.userId` SHALL have a self-highlight indicator, regardless of rank.

**Validates: Requirements 7.5**

---

## Error Handling

### Lỗi tham gia phòng

| Tình huống | Hành vi |
|---|---|
| Session_Code không tồn tại | Hiển thị "Mã phòng không hợp lệ hoặc đã hết hạn" |
| Session đã `finished` | Hiển thị "Phiên thi đã kết thúc" |
| Session đã `active` | Hiển thị "Phiên thi đang diễn ra, không thể tham gia" |
| Session hết hạn (> 24h) | Xử lý như code không tồn tại |

### Lỗi điều khiển phiên

| Tình huống | Hành vi |
|---|---|
| Non-host cố start/end | Trả về lỗi `UNAUTHORIZED`, không thay đổi state |
| Start session không ở trạng thái `waiting` | Trả về lỗi `INVALID_STATE` |
| End session không ở trạng thái `active` | Trả về lỗi `INVALID_STATE` |

### Lỗi kết nối

- Nếu Firestore mất kết nối trong khi làm bài, lưu answers vào `localStorage` tạm thời.
- Khi kết nối lại, tự động sync lại `currentQuestionIndex` và answers chưa submit.
- Hiển thị banner "Đang kết nối lại..." khi offline.

### Lỗi submit

- Nếu submit thất bại, retry tối đa 3 lần với exponential backoff.
- Nếu vẫn thất bại, lưu vào `localStorage` và thông báo người dùng.

---

## Testing Strategy

### Dual Testing Approach

Tính năng này có nhiều pure functions (score calculation, sorting, validation, formatting) phù hợp với property-based testing, kết hợp với example-based tests cho UI và integration tests cho Firestore.

**Property-based testing library:** [fast-check](https://github.com/dubzzz/fast-check) (TypeScript-native, không cần cài thêm runtime)

Cài đặt:
```bash
npm install --save-dev fast-check vitest @vitest/coverage-v8
```

### Unit & Property Tests

Mỗi property trong phần Correctness Properties được implement bằng một property-based test với `fast-check`, chạy tối thiểu 100 iterations.

Tag format cho mỗi test:
```
// Feature: shared-quiz-session, Property N: <property_text>
```

**Các pure functions cần test:**

| Function | Test type | Properties |
|---|---|---|
| `generateSessionCode()` | Property | P1 |
| `validateTimeLimit(n)` | Property | P3 |
| `calculateScore(answers)` | Property | P10 |
| `sortLeaderboard(participants)` | Property | P17 |
| `formatProgress(index, total)` | Property | P16 |
| `shouldShowWarning(participant)` | Property | P15 |
| Session TTL calculation | Property | P2 |
| Join initial state | Property | P4 |
| Join idempotence | Property | P5 |
| State transitions | Property | P7, P8, P9 |
| Submission fields | Property | P11 |
| Tab monitor logic | Property | P13, P14 |
| Auto-submit on expiry | Property | P12 |
| Leaderboard highlight | Property | P18, P19 |

### Example-based Tests

- Waiting room hiển thị đúng danh sách participants
- Session_Code hiển thị sau khi tạo phòng
- Score và percentage hiển thị sau khi submit
- Success indicator sau khi submit thành công
- Các trạng thái participant (`joined`, `submitted`, `tab_left`) render khác nhau trên dashboard

### Integration Tests

- Firestore `onSnapshot` fires khi session status thay đổi sang `active`
- Firestore `onSnapshot` fires khi session status thay đổi sang `finished`
- `updateProgress` ghi đúng vào Firestore và được phản ánh trong subscription
- Realtime dashboard cập nhật khi participant thay đổi `currentQuestionIndex`

### Smoke Tests (Firestore Rules)

- Unauthenticated user bị từ chối khi đọc/ghi session
- Participant không thể update record của người khác
- Non-host không thể thay đổi session status
- Participant có thể đọc records của participants khác trong cùng session
