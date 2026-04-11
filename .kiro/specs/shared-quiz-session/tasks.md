# Implementation Plan: Shared Quiz Session

## Overview

Triển khai tính năng Shared Quiz Session theo kiến trúc đã thiết kế: service layer (`sessionService.ts`), hooks (`useTabMonitor`, `useSessionTimer`), routes mới (`/join`, `/session/[sessionId]`), và các component UI. Tích hợp vào `QuizManager` hiện có mà không thay đổi `quizService.ts`.

## Tasks

- [x] 1. Cài đặt dependencies và định nghĩa types
  - Cài `fast-check` và `vitest` vào devDependencies: `npm install --save-dev fast-check vitest @vitest/coverage-v8`
  - Tạo file `src/types/session.ts` chứa các interface: `Session`, `ParticipantRecord`, `SessionAnswer`
  - Định nghĩa đầy đủ các trường theo data model trong design (bao gồm `status` union type, `Timestamp` từ firebase)
  - _Requirements: 1.1, 2.1, 4.3_

- [x] 2. Implement sessionService — pure utility functions
  - Tạo file `src/services/sessionService.ts`
  - [x] 2.1 Implement `generateSessionCode(): string`
    - Tạo chuỗi 6 ký tự uppercase alphanumeric ngẫu nhiên
    - _Requirements: 1.2_
  - [ ]* 2.2 Write property test cho `generateSessionCode` (Property 1)
    - **Property 1: Session_Code format** — mọi kết quả phải là 6 ký tự [A-Z0-9]
    - **Validates: Requirements 1.2**
  - [x] 2.3 Implement `validateTimeLimit(n: number): boolean`
    - Trả về `true` khi và chỉ khi `5 ≤ n ≤ 180`
    - _Requirements: 1.4_
  - [ ]* 2.4 Write property test cho `validateTimeLimit` (Property 3)
    - **Property 3: Time limit validation**
    - **Validates: Requirements 1.4**
  - [x] 2.5 Implement `calculateScore(answers: SessionAnswer[]): number`
    - Đếm số `answers` có `isCorrect === true`
    - _Requirements: 6.1_
  - [ ]* 2.6 Write property test cho `calculateScore` (Property 10)
    - **Property 10: Score calculation correctness**
    - **Validates: Requirements 6.1**
  - [x] 2.7 Implement `formatProgress(currentQuestionIndex: number, total: number): string`
    - Trả về `"${currentQuestionIndex}/${total}"`
    - _Requirements: 4.2_
  - [ ]* 2.8 Write property test cho `formatProgress` (Property 16)
    - **Property 16: Progress format**
    - **Validates: Requirements 4.2**
  - [x] 2.9 Implement `shouldShowWarning(participant: ParticipantRecord): boolean`
    - Trả về `true` khi `tabLeftCount > 3`
    - _Requirements: 5.5_
  - [ ]* 2.10 Write property test cho `shouldShowWarning` (Property 15)
    - **Property 15: Warning threshold**
    - **Validates: Requirements 5.5**
  - [x] 2.11 Implement `sortLeaderboard(participants: ParticipantRecord[]): ParticipantRecord[]`
    - Sắp xếp giảm dần theo `score`, tie-break bằng `submittedAt` tăng dần
    - _Requirements: 7.1, 7.2_
  - [ ]* 2.12 Write property test cho `sortLeaderboard` (Property 17)
    - **Property 17: Leaderboard sort order** — mọi cặp liền kề `(a, b)` phải thỏa `a.score > b.score` hoặc `(a.score === b.score && a.submittedAt ≤ b.submittedAt)`
    - **Validates: Requirements 7.1, 7.2**
  - [x] 2.13 Implement `isSessionExpired(session: Session): boolean`
    - So sánh `session.expiresAt` với thời điểm hiện tại
    - _Requirements: 1.3_
  - [ ]* 2.14 Write property test cho Session TTL invariant (Property 2)
    - **Property 2: Session TTL invariant** — `expiresAt === createdAt + 24h`
    - **Validates: Requirements 1.3**

- [ ] 3. Checkpoint — Đảm bảo tất cả pure function tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement sessionService — Firestore operations
  - Tiếp tục trong `src/services/sessionService.ts`
  - [x] 4.1 Implement `createSession(hostId, quizSet, timeLimitMinutes?): Promise<string>`
    - Tạo Session document tại `quiz_sessions/{sessionId}` với `status: 'waiting'`, `sessionCode` từ `generateSessionCode()`, `expiresAt = createdAt + 24h`, snapshot `questions` từ QuizSet
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 4.2 Write property test cho join initial state (Property 4)
    - **Property 4: Join initializes participant correctly** — `status = 'joined'`, `currentQuestionIndex = 0`
    - **Validates: Requirements 2.1**
  - [x] 4.3 Implement `joinSession(sessionCode, userId, displayName): Promise<string>`
    - Query Firestore theo `sessionCode` và `status in ['waiting', 'active']`
    - Kiểm tra session không `finished` hoặc `expired`
    - Nếu user đã có record → trả về `sessionId` (idempotent)
    - Nếu session `active` → throw lỗi `INVALID_STATE`
    - Tạo `ParticipantRecord` với `status: 'joined'`, `currentQuestionIndex: 0`, `tabLeftCount: 0`, `isTabActive: true`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3_
  - [ ]* 4.4 Write property test cho join idempotence (Property 5)
    - **Property 5: Join idempotence** — gọi `joinSession` lần 2 không tạo record mới
    - **Validates: Requirements 2.4**
  - [ ]* 4.5 Write property test cho active session rejects join (Property 6)
    - **Property 6: Active session rejects new joins**
    - **Validates: Requirements 3.3**
  - [x] 4.6 Implement `startSession(sessionId, hostId): Promise<void>`
    - Kiểm tra `hostId === session.hostId`, nếu không → throw `UNAUTHORIZED`
    - Kiểm tra `status === 'waiting'`, nếu không → throw `INVALID_STATE`
    - Update `status: 'active'`, `startedAt: Timestamp.now()`
    - _Requirements: 3.1, 8.3_
  - [ ]* 4.7 Write property test cho state transition start (Property 7)
    - **Property 7: State transition — start session**
    - **Validates: Requirements 3.1**
  - [x] 4.8 Implement `endSession(sessionId, hostId): Promise<void>`
    - Kiểm tra `hostId === session.hostId`, nếu không → throw `UNAUTHORIZED`
    - Kiểm tra `status === 'active'`, nếu không → throw `INVALID_STATE`
    - Update `status: 'finished'`, `endedAt: Timestamp.now()`
    - _Requirements: 3.2, 8.3_
  - [ ]* 4.9 Write property test cho state transition end (Property 8)
    - **Property 8: State transition — end session**
    - **Validates: Requirements 3.2**
  - [ ]* 4.10 Write property test cho host-only authorization (Property 9)
    - **Property 9: Host-only authorization** — non-host không thể start/end
    - **Validates: Requirements 8.3**
  - [x] 4.11 Implement `updateProgress(sessionId, userId, currentQuestionIndex): Promise<void>`
    - Update `currentQuestionIndex` trong `ParticipantRecord`
    - _Requirements: 4.1_
  - [x] 4.12 Implement `submitAnswers(sessionId, userId, answers): Promise<void>`
    - Tính `score` bằng `calculateScore(answers)`
    - Update `ParticipantRecord`: `status: 'submitted'`, `score`, `answers`, `submittedAt: Timestamp.now()`
    - _Requirements: 4.3, 6.1, 6.2, 6.5_
  - [ ]* 4.13 Write property test cho submission stores required fields (Property 11)
    - **Property 11: Submission stores all required fields**
    - **Validates: Requirements 4.3, 6.2**
  - [x] 4.14 Implement `subscribeToSession` và `subscribeToParticipants`
    - `subscribeToSession`: `onSnapshot` trên `quiz_sessions/{sessionId}`
    - `subscribeToParticipants`: `onSnapshot` trên subcollection `participants`
    - _Requirements: 4.4, 3.4, 3.5_

- [x] 5. Implement hooks
  - [x] 5.1 Tạo `src/hooks/useTabMonitor.ts`
    - Lắng nghe `document.visibilityState` qua `visibilitychange` event
    - Khi tab ẩn: gọi `updateProgress` để increment `tabLeftCount`, cập nhật `lastTabLeftAt`, set `isTabActive: false`
    - Khi tab hiện: set `isTabActive: true`
    - Chỉ active khi `isActive === true`
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 5.2 Write property test cho tab leave increments counter (Property 13)
    - **Property 13: Tab leave increments counter** — `tabLeftCount` tăng 1 mỗi lần tab ẩn
    - **Validates: Requirements 5.1, 5.2**
  - [ ]* 5.3 Write property test cho tab return restores active state (Property 14)
    - **Property 14: Tab return restores active state** — `isTabActive = true` sau khi tab quay lại
    - **Validates: Requirements 5.3**
  - [x] 5.4 Tạo `src/hooks/useSessionTimer.ts`
    - Nhận `session: Session` và `onExpire: () => void`
    - Tính `timeRemaining` từ `startedAt + timeLimitMinutes * 60s - now`
    - Gọi `onExpire()` khi `timeRemaining <= 0`
    - Trả về `{ timeRemaining: number }`
    - _Requirements: 6.4_
  - [ ]* 5.5 Write property test cho auto-submit on expiry (Property 12)
    - **Property 12: Auto-submit on expiry** — participant chưa submit được auto_submitted khi hết giờ
    - **Validates: Requirements 6.4**

- [ ] 6. Checkpoint — Đảm bảo tất cả service và hook tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Cập nhật Firestore Rules
  - Thêm rules cho collection `quiz_sessions` vào `firestore.rules`:
    - Authenticated user có thể tạo session (`create`)
    - Bất kỳ authenticated user có thể đọc session (`read`)
    - Chỉ host (`request.auth.uid == resource.data.hostId`) mới được update session document
    - Subcollection `participants/{userId}`: user chỉ được write record của chính mình
    - Mọi participant trong session có thể đọc tất cả participant records
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Tạo routes và layout mới (Next.js App Router)
  - Đọc `node_modules/next/dist/docs/` để xác nhận App Router conventions trước khi tạo file
  - Tạo `src/app/join/page.tsx` — trang nhập Session_Code
  - Tạo `src/app/session/[sessionId]/page.tsx` — trang phiên thi (phân nhánh Host/Participant)
  - _Requirements: 1.5, 2.1_

- [x] 9. Implement JoinSessionForm component
  - Tạo `src/components/session/JoinSessionForm.tsx`
  - Input nhập Session_Code (6 ký tự, auto-uppercase)
  - Gọi `joinSession` khi submit, redirect đến `/session/[sessionId]` khi thành công
  - Hiển thị error message theo từng trường hợp lỗi (invalid code, session ended, session active)
  - _Requirements: 2.2, 2.3_

- [x] 10. Implement WaitingRoom components
  - [x] 10.1 Tạo `src/components/session/WaitingRoomHost.tsx`
    - Hiển thị `sessionCode` nổi bật để Host chia sẻ
    - Hiển thị danh sách participants đã join (realtime qua `subscribeToParticipants`)
    - Nút "Bắt đầu thi" gọi `startSession`
    - _Requirements: 1.5, 2.5, 3.1_
  - [x] 10.2 Tạo `src/components/session/WaitingRoomParticipant.tsx`
    - Hiển thị thông báo chờ host bắt đầu
    - Hiển thị danh sách participants đã join
    - Subscribe session status, tự động chuyển sang quiz khi `status === 'active'`
    - _Requirements: 2.5, 3.4_

- [x] 11. Implement QuizActiveSession component
  - Tạo `src/components/session/QuizActiveSession.tsx`
  - Hiển thị từng câu hỏi từ `session.questions`, cho phép chọn đáp án
  - Gọi `updateProgress` mỗi khi chuyển câu
  - Tích hợp `useTabMonitor` và `useSessionTimer`
  - Nút "Nộp bài" gọi `submitAnswers`, hiển thị score và percentage sau khi nộp thành công (success indicator)
  - Khi `useSessionTimer` expire: tự động gọi `submitAnswers` với `status: 'auto_submitted'`
  - Lưu answers vào `localStorage` khi offline, sync lại khi reconnect
  - Hiển thị banner "Đang kết nối lại..." khi offline
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Implement HostDashboard component
  - Tạo `src/components/session/HostDashboard.tsx`
  - Subscribe `subscribeToParticipants`, hiển thị realtime progress của từng participant
  - Mỗi participant row: tên, progress (`formatProgress`), status badge (`joined`/`submitted`/`tab_left`)
  - Hiển thị `tabLeftCount`, flag warning khi `shouldShowWarning` trả về `true`
  - Nút "Kết thúc phiên" gọi `endSession`
  - _Requirements: 4.2, 4.4, 4.5, 5.4, 5.5, 3.2_

- [x] 13. Implement LeaderboardView component
  - Tạo `src/components/session/LeaderboardView.tsx`
  - Nhận `participants: ParticipantRecord[]` và `currentUserId: string`
  - Gọi `sortLeaderboard` để sắp xếp
  - Hiển thị: rank, tên, score, total, percentage, submittedAt
  - Highlight top 3 với visual indicator
  - Highlight entry của `currentUserId`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 13.1 Write property test cho leaderboard top-3 highlight (Property 18)
    - **Property 18: Leaderboard top-3 highlight** — đúng `min(3, N)` entries được highlight
    - **Validates: Requirements 7.4**
  - [ ]* 13.2 Write property test cho self-entry highlight (Property 19)
    - **Property 19: Self-entry highlight** — entry của currentUserId luôn được highlight bất kể rank
    - **Validates: Requirements 7.5**

- [x] 14. Implement HostSessionView và ParticipantSessionView
  - Tạo `src/components/session/HostSessionView.tsx`
    - Render `WaitingRoomHost` khi `status === 'waiting'`
    - Render `HostDashboard` khi `status === 'active'`
    - Render `LeaderboardView` khi `status === 'finished'`
  - Tạo `src/components/session/ParticipantSessionView.tsx`
    - Render `WaitingRoomParticipant` khi `status === 'waiting'`
    - Render `QuizActiveSession` khi `status === 'active'`
    - Render `LeaderboardView` khi `status === 'finished'`
  - Cả hai đều subscribe `subscribeToSession` để nhận status updates realtime
  - _Requirements: 3.4, 3.5_

- [x] 15. Tích hợp vào QuizManager — SharedSessionButton
  - Tạo `src/components/session/SharedSessionButton.tsx`
    - Nút "Tạo phòng thi chung" trên mỗi QuizSet card
    - Gọi `createSession`, redirect đến `/session/[sessionId]`
  - Thêm `SharedSessionButton` vào QuizSet card trong `src/components/QuizManager.tsx`
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 16. Wire `/session/[sessionId]` page
  - Trong `src/app/session/[sessionId]/page.tsx`:
    - Subscribe session bằng `subscribeToSession`
    - Nếu `user.uid === session.hostId` → render `HostSessionView`
    - Nếu không → render `ParticipantSessionView`
    - Redirect về `/join` nếu user chưa có `ParticipantRecord` trong session
  - _Requirements: 8.1, 8.3_

- [ ] 17. Final checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional, có thể bỏ qua để ra MVP nhanh hơn
- Mỗi property test dùng `fast-check` với tối thiểu 100 iterations
- Tag format cho mỗi test: `// Feature: shared-quiz-session, Property N: <property_text>`
- Không sửa `quizService.ts` — toàn bộ logic session nằm trong `sessionService.ts` mới
- Đọc `node_modules/next/dist/docs/` trước khi tạo bất kỳ file route nào (App Router có breaking changes)
- Retry submit tối đa 3 lần với exponential backoff khi thất bại
