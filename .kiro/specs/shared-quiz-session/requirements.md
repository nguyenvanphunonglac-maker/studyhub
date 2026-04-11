# Requirements Document

## Introduction

Tính năng **Shared Quiz Session** cho phép một người dùng (host) tạo một phòng thi trực tuyến từ một bộ đề (QuizSet) có sẵn, mời nhiều người tham gia cùng làm bài trong thời gian thực. Host có thể theo dõi tiến độ từng thành viên (đang làm câu nào, đã nộp chưa), phát hiện khi ai đó thoát tab, và xem bảng điểm sau khi phiên kết thúc. Tính năng được xây dựng trên nền Firebase Firestore (realtime) và tích hợp vào hệ thống QuizManager hiện có.

---

## Glossary

- **Session**: Một phiên thi chung, được tạo bởi Host từ một QuizSet. Có trạng thái `waiting` → `active` → `finished`.
- **Session_Manager**: Hệ thống phụ trách tạo, cập nhật và xóa Session trên Firestore.
- **Host**: Người dùng đã đăng nhập, tạo Session và có quyền kiểm soát phiên thi.
- **Participant**: Người dùng đã đăng nhập, tham gia Session bằng mã phòng (Session Code).
- **Session_Code**: Chuỗi 6 ký tự chữ hoa ngẫu nhiên, dùng để tham gia phòng thi.
- **Participant_Record**: Bản ghi trạng thái của một Participant trong Session, bao gồm tiến độ, trạng thái nộp bài, điểm số, và trạng thái tab.
- **Progress_Tracker**: Hệ thống theo dõi và cập nhật Participant_Record theo thời gian thực.
- **Tab_Monitor**: Cơ chế phát hiện khi Participant rời khỏi tab trình duyệt đang làm bài.
- **Leaderboard**: Bảng xếp hạng điểm số của tất cả Participant sau khi Session kết thúc.
- **QuizSet**: Bộ đề trắc nghiệm hiện có trong hệ thống, chứa danh sách Question.
- **Question**: Câu hỏi trắc nghiệm gồm nội dung, 4 lựa chọn và đáp án đúng.

---

## Requirements

### Requirement 1: Tạo phiên thi chung

**User Story:** As a Host, I want to create a shared quiz session from an existing QuizSet, so that I can invite others to take the test together.

#### Acceptance Criteria

1. WHEN a Host selects a QuizSet and initiates session creation, THE Session_Manager SHALL create a new Session document in Firestore with status `waiting`, a unique Session_Code, the QuizSet's questions, and the Host's user ID.
2. THE Session_Manager SHALL generate a Session_Code consisting of exactly 6 uppercase alphanumeric characters.
3. WHEN a Session is created, THE Session_Manager SHALL set a time-to-live of 24 hours, after which the Session SHALL be considered expired.
4. THE Session_Manager SHALL allow the Host to set an optional time limit between 5 and 180 minutes for the Session.
5. WHEN a Session is created, THE Session_Manager SHALL display the Session_Code prominently to the Host for sharing.

---

### Requirement 2: Tham gia phiên thi

**User Story:** As a Participant, I want to join a shared quiz session using a session code, so that I can take the test with my group.

#### Acceptance Criteria

1. WHEN an authenticated user submits a valid Session_Code, THE Session_Manager SHALL add a Participant_Record for that user to the Session with status `joined` and `currentQuestionIndex` set to 0.
2. IF a user submits a Session_Code that does not match any active Session, THEN THE Session_Manager SHALL return an error message indicating the code is invalid or expired.
3. IF a user attempts to join a Session with status `finished`, THEN THE Session_Manager SHALL reject the join request and display a message that the session has ended.
4. IF a user attempts to join a Session they have already joined, THEN THE Session_Manager SHALL restore their existing Participant_Record without creating a duplicate.
5. WHILE a Session has status `waiting`, THE Session_Manager SHALL display a waiting room showing all currently joined Participants to both the Host and Participants.

---

### Requirement 3: Kiểm soát phiên thi (Host)

**User Story:** As a Host, I want to start and end the quiz session, so that I can control when participants begin and stop taking the test.

#### Acceptance Criteria

1. WHEN the Host clicks "Bắt đầu thi", THE Session_Manager SHALL update the Session status from `waiting` to `active` and record the start timestamp.
2. WHEN the Host clicks "Kết thúc phiên", THE Session_Manager SHALL update the Session status to `finished` and record the end timestamp.
3. WHILE a Session has status `active`, THE Session_Manager SHALL prevent new Participants from joining.
4. WHEN the Session status changes to `active`, THE Session_Manager SHALL notify all Participants in the waiting room to begin the quiz.
5. WHEN the Session status changes to `finished`, THE Session_Manager SHALL notify all active Participants that the session has ended and display the Leaderboard.

---

### Requirement 4: Làm bài và theo dõi tiến độ

**User Story:** As a Host, I want to see each participant's real-time progress, so that I can monitor who is on which question and who has submitted.

#### Acceptance Criteria

1. WHEN a Participant answers a question and moves to the next, THE Progress_Tracker SHALL update that Participant's `currentQuestionIndex` in their Participant_Record within 2 seconds.
2. THE Progress_Tracker SHALL display each Participant's progress as a ratio of questions answered to total questions (e.g., "5/20") on the Host's monitoring dashboard.
3. WHEN a Participant submits their answers, THE Progress_Tracker SHALL update their Participant_Record status to `submitted` and record their score and submission timestamp.
4. WHILE a Session has status `active`, THE Progress_Tracker SHALL update the Host's dashboard in real time using Firestore onSnapshot listeners.
5. THE Progress_Tracker SHALL visually distinguish between Participants with status `joined`, `submitted`, and `tab_left` on the Host's dashboard.

---

### Requirement 5: Phát hiện thoát tab

**User Story:** As a Host, I want to know when a participant leaves the quiz tab, so that I can detect potential cheating or disengagement.

#### Acceptance Criteria

1. WHEN a Participant's browser tab loses visibility (document.visibilityState becomes `hidden`), THE Tab_Monitor SHALL update that Participant's `tabLeftCount` by incrementing it by 1 in their Participant_Record.
2. WHEN a Participant's browser tab loses visibility, THE Tab_Monitor SHALL update that Participant's `lastTabLeftAt` timestamp in their Participant_Record.
3. WHEN a Participant's browser tab regains visibility, THE Tab_Monitor SHALL update that Participant's `isTabActive` field to `true` in their Participant_Record.
4. THE Tab_Monitor SHALL display the `tabLeftCount` for each Participant on the Host's monitoring dashboard.
5. IF a Participant's `tabLeftCount` exceeds 3, THEN THE Tab_Monitor SHALL visually flag that Participant's entry on the Host's dashboard with a warning indicator.

---

### Requirement 6: Nộp bài và tính điểm

**User Story:** As a Participant, I want to submit my answers and see my score, so that I know how well I performed.

#### Acceptance Criteria

1. WHEN a Participant submits their answers, THE Session_Manager SHALL calculate the score as the count of correct answers out of total questions.
2. WHEN a Participant submits their answers, THE Session_Manager SHALL store the score, total question count, and per-question answer details in their Participant_Record.
3. WHEN a Participant submits their answers, THE Session_Manager SHALL display the Participant's own score and percentage immediately after submission.
4. IF the Session time limit expires while a Participant has not submitted, THEN THE Session_Manager SHALL automatically submit that Participant's current answers and mark their status as `auto_submitted`.
5. WHEN a Participant's submission is saved, THE Session_Manager SHALL confirm the save with a success indicator visible to the Participant.

---

### Requirement 7: Bảng xếp hạng (Leaderboard)

**User Story:** As a Host and Participant, I want to see a leaderboard after the session ends, so that everyone can compare results.

#### Acceptance Criteria

1. WHEN a Session status changes to `finished`, THE Leaderboard SHALL display all Participants ranked by score in descending order.
2. WHERE two Participants have equal scores, THE Leaderboard SHALL rank the Participant with the earlier submission timestamp higher.
3. THE Leaderboard SHALL display each Participant's display name, score, total questions, percentage, and submission time.
4. THE Leaderboard SHALL visually highlight the top 3 ranked Participants.
5. WHEN a Participant views the Leaderboard, THE Leaderboard SHALL highlight that Participant's own entry for easy identification.

---

### Requirement 8: Bảo mật và phân quyền

**User Story:** As a system, I want to enforce access control on session data, so that only authorized users can read or modify session records.

#### Acceptance Criteria

1. THE Session_Manager SHALL only allow authenticated users to create, join, or read Sessions.
2. WHEN a Participant_Record is updated, THE Session_Manager SHALL only allow the update if the requesting user's ID matches the Participant_Record's `userId`.
3. WHEN Session control actions (start, end) are requested, THE Session_Manager SHALL only allow the action if the requesting user's ID matches the Session's `hostId`.
4. THE Session_Manager SHALL allow all Participants of a Session to read all Participant_Records within that Session for real-time progress display.
5. IF an unauthenticated user attempts to access any Session data, THEN THE Session_Manager SHALL reject the request.
