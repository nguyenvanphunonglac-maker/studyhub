# Tài liệu Xây dựng Hệ thống StudyHub

## Mục lục

1. [Xác định chức năng](#1-xác-định-chức-năng)
2. [Xác định công nghệ và cấu trúc dữ liệu](#2-xác-định-công-nghệ-và-cấu-trúc-dữ-liệu)
3. [Thiết lập Firebase](#3-thiết-lập-firebase)
4. [Cấu trúc thư mục dự án](#4-cấu-trúc-thư-mục-dự-án)
5. [Kết nối Firebase vào dự án](#5-kết-nối-firebase-vào-dự-án)
6. [Xây dựng từng chức năng](#6-xây-dựng-từng-chức-năng)

---

## 1. Xác định chức năng

StudyHub là ứng dụng học tập toàn diện, bao gồm các nhóm chức năng sau:

### 1.1 Xác thực người dùng
- Đăng nhập bằng Google (OAuth)
- Onboarding thu thập thông tin: tên, tuổi, lớp, môn học quan tâm
- Quản lý hồ sơ người dùng

### 1.2 Ghi chú (Notes)
- Tạo, sửa, xóa ghi chú dạng Markdown
- Phân loại theo tag và môn học
- Tìm kiếm toàn văn

### 1.3 Flashcard
- Tạo bộ thẻ ghi nhớ (FlashcardSet) với nhiều thẻ (front/back)
- Ôn luyện theo thuật toán SRS (SM-2 Spaced Repetition)
- Các chế độ học: Flip, Write (gõ đáp án), Match (ghép cặp), Khối hộp (kéo thả), Blast (game bắn thiên thạch)
- Theo dõi tiến độ từng thẻ: Chưa biết / Đang học / Đã thuộc
- Chia sẻ bộ thẻ lên cộng đồng

### 1.4 Quiz (Bài kiểm tra)
- Tạo bộ đề (QuizSet) với câu hỏi trắc nghiệm 4 đáp án
- Import câu hỏi từ file CSV
- Thêm hình ảnh vào câu hỏi
- Xáo trộn câu hỏi
- Lưu lịch sử kết quả

### 1.5 Phòng thi chung (Shared Quiz Session)
- Host tạo phòng thi từ bộ đề, sinh mã 6 ký tự
- Participants tham gia bằng mã phòng
- Realtime: theo dõi tiến độ từng người, phát hiện thoát tab
- Bảng xếp hạng sau khi kết thúc

### 1.6 Cộng đồng
- Đăng bài thảo luận kèm hình ảnh
- Like, bình luận
- Chia sẻ và clone bộ đề/bộ thẻ công khai

### 1.7 Kanban (Quản lý nhiệm vụ)
- Tạo task với 3 cột: Cần làm / Đang làm / Hoàn thành
- Phân loại theo mức độ ưu tiên

### 1.8 Habit Tracker
- Tạo thói quen học tập hàng ngày
- Theo dõi streak 14 ngày

### 1.9 Goal Tracker
- Đặt mục tiêu học tập (điểm quiz, số bài, số ngày)
- Tự động cập nhật tiến độ từ kết quả quiz

### 1.10 Pomodoro Timer
- Đếm giờ học theo kỹ thuật Pomodoro
- Lưu lịch sử phiên học

### 1.11 Mind Map
- Tạo sơ đồ tư duy trực quan

### 1.12 Dashboard thống kê
- Tổng quan: số ghi chú, thẻ cần ôn, bộ đề, streak
- Ghi chú gần đây, kết quả quiz gần nhất

---

## 2. Xác định công nghệ và cấu trúc dữ liệu

### 2.1 Ngôn ngữ & Framework

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | TypeScript |
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Font | Plus Jakarta Sans |

### 2.2 Dịch vụ Firebase

| Dịch vụ | Mục đích |
|---|---|
| **Firebase Authentication** | Đăng nhập Google OAuth |
| **Cloud Firestore** | Lưu trữ toàn bộ dữ liệu (realtime) |
| **Firebase Hosting** | Deploy ứng dụng tĩnh |

> Không dùng Firebase Storage — ảnh được upload lên GitHub repository thông qua GitHub API.

### 2.3 Thư viện bổ sung

| Thư viện | Mục đích |
|---|---|
| `papaparse` | Parse file CSV để import câu hỏi |
| `mammoth` | Đọc file Word (.docx) |
| `pdfjs-dist` | Đọc file PDF |
| `@xyflow/react` | Vẽ Mind Map |
| `@google/generative-ai` | Tích hợp Gemini AI |
| `highlight.js` | Highlight code trong ghi chú |
| `react-markdown` | Render Markdown |
| `next-themes` | Quản lý theme sáng/tối |

### 2.4 Cấu trúc dữ liệu Firestore

```
Firestore
├── users/{userId}                          # Hồ sơ người dùng
│   ├── displayName, email, photoURL
│   ├── streak, lastLogin
│   ├── age, grade, subjects[]              # Onboarding
│   ├── onboardingCompleted: boolean
│   │
│   ├── notes/{noteId}                      # Ghi chú
│   │   ├── title, content (Markdown)
│   │   ├── tags[], subject
│   │   └── createdAt, updatedAt
│   │
│   ├── flashcardSets/{setId}               # Bộ thẻ ghi nhớ
│   │   ├── title, description, subject
│   │   ├── isPublic, authorName
│   │   └── cards[]: { front, back, easeFactor, interval, repetitions, nextReview }
│   │
│   ├── quizSets/{setId}                    # Bộ đề trắc nghiệm
│   │   ├── title, description, subject
│   │   ├── isPublic, authorName
│   │   └── questions[]: { text, options[], correctAnswer, imageUrl? }
│   │
│   ├── results/{resultId}                  # Lịch sử kết quả quiz
│   │   ├── score, total, date
│   │   └── answers[]: { questionText, userAnswer, correctAnswer, isCorrect }
│   │
│   ├── kanbanTasks/{taskId}                # Nhiệm vụ Kanban
│   │   ├── title, description
│   │   ├── status: 'todo' | 'doing' | 'done'
│   │   └── priority: 'low' | 'medium' | 'high'
│   │
│   ├── habits/{habitId}                    # Thói quen
│   │   ├── name, color
│   │   └── logs/{date}: { completed: boolean }
│   │
│   ├── goals/{goalId}                      # Mục tiêu học tập
│   │   ├── title, description, type, period
│   │   ├── target, current, unit
│   │   ├── status: 'active' | 'completed'
│   │   └── startDate, endDate
│   │
│   └── mindmaps/{mapId}                    # Sơ đồ tư duy
│       ├── title
│       └── nodes[], edges[]
│
├── notes/{noteId}                          # Ghi chú root (legacy)
│
├── community_posts/{postId}                # Bài đăng cộng đồng
│   ├── userId, userName, content
│   ├── images[], likes, likedBy[]
│   └── comments/{commentId}
│
├── pomodoro_sessions/{sessionId}           # Phiên Pomodoro
│   ├── userId, duration, type
│   └── startedAt, endedAt
│
└── quiz_sessions/{sessionId}              # Phòng thi chung
    ├── sessionCode (6 ký tự)
    ├── hostId, hostName
    ├── questions[] (snapshot từ QuizSet)
    ├── status: 'waiting' | 'active' | 'finished'
    ├── timeLimitMinutes?, createdAt, expiresAt
    └── participants/{userId}              # Subcollection
        ├── displayName, status
        ├── currentQuestionIndex, answers[]
        ├── score, submittedAt
        └── tabLeftCount, isTabActive
```

---

## 3. Thiết lập Firebase

### Bước 1: Tạo project Firebase

1. Truy cập [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Đặt tên project (ví dụ: `studyhub-2026`)
3. Tắt Google Analytics nếu không cần → Click **"Create project"**

### Bước 2: Bật Authentication

1. Vào **Authentication** → **Get started**
2. Tab **Sign-in method** → Bật **Google**
3. Điền tên hiển thị và email hỗ trợ → **Save**

### Bước 3: Tạo Firestore Database

1. Vào **Firestore Database** → **Create database**
2. Chọn **"Start in production mode"**
3. Chọn region gần nhất (ví dụ: `asia-southeast1`)
4. Click **"Enable"**

### Bước 4: Cấu hình Firestore Rules

Vào **Firestore** → **Rules** → Dán nội dung file `firestore.rules` vào → **Publish**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/{allSubcollections=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // ... (xem file firestore.rules đầy đủ)
  }
}
```

### Bước 5: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng bánh răng) → **General**
2. Kéo xuống **"Your apps"** → Click **"</>"** (Web app)
3. Đặt tên app → **Register app**
4. Copy đoạn `firebaseConfig`

### Bước 6: Thiết lập Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Chọn project, public directory: "out", SPA: yes
```

---

## 4. Cấu trúc thư mục dự án

```
studyhub/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout, font, providers
│   │   ├── page.tsx                # Trang chủ (redirect đến Dashboard)
│   │   ├── providers.tsx           # ThemeProvider, AuthProvider, OnboardingGate
│   │   ├── globals.css             # CSS variables, themes, utilities
│   │   ├── join/
│   │   │   └── page.tsx            # Trang nhập mã phòng thi
│   │   └── session/[sessionId]/
│   │       ├── page.tsx            # Server component (generateStaticParams)
│   │       └── SessionPageClient.tsx  # Client component phòng thi
│   │
│   ├── components/                 # UI Components
│   │   ├── Dashboard.tsx           # Layout chính, routing giữa các view
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── Login.tsx               # Màn hình đăng nhập
│   │   ├── OnboardingModal.tsx     # Modal thu thập thông tin lần đầu
│   │   ├── SettingsToggle.tsx      # Panel cài đặt (theme, ngôn ngữ, hồ sơ)
│   │   ├── StatsDashboard.tsx      # Trang tổng quan thống kê
│   │   ├── Editor.tsx              # Trình soạn thảo ghi chú Markdown
│   │   ├── FlashcardManager.tsx    # Quản lý flashcard + các game mode
│   │   ├── QuizManager.tsx         # Quản lý quiz + làm bài
│   │   ├── Community.tsx           # Trang cộng đồng
│   │   ├── KanbanBoard.tsx         # Bảng Kanban
│   │   ├── HabitTracker.tsx        # Theo dõi thói quen
│   │   ├── GoalTracker.tsx         # Theo dõi mục tiêu
│   │   ├── Pomodoro.tsx            # Đồng hồ Pomodoro
│   │   ├── MindMap.tsx             # Sơ đồ tư duy
│   │   ├── MatchGame.tsx           # Game ghép cặp flashcard
│   │   ├── WriteMode.tsx           # Chế độ gõ đáp án
│   │   ├── SortingGame.tsx         # Game kéo thả nhóm
│   │   ├── BlastGame.tsx           # Game bắn thiên thạch
│   │   └── session/                # Components phòng thi chung
│   │       ├── HostSessionView.tsx
│   │       ├── ParticipantSessionView.tsx
│   │       ├── WaitingRoomHost.tsx
│   │       ├── WaitingRoomParticipant.tsx
│   │       ├── HostDashboard.tsx
│   │       ├── QuizActiveSession.tsx
│   │       ├── LeaderboardView.tsx
│   │       ├── JoinSessionForm.tsx
│   │       └── SharedSessionButton.tsx
│   │
│   ├── services/                   # Firebase service layer
│   │   ├── userService.ts          # CRUD hồ sơ người dùng, streak
│   │   ├── noteService.ts          # CRUD ghi chú
│   │   ├── flashcardService.ts     # CRUD flashcard, SRS algorithm
│   │   ├── quizService.ts          # CRUD quiz, lưu kết quả
│   │   ├── sessionService.ts       # Phòng thi chung (realtime)
│   │   ├── communityService.ts     # Bài đăng, like, comment
│   │   ├── kanbanService.ts        # CRUD Kanban tasks
│   │   ├── habitService.ts         # CRUD habits, logs
│   │   ├── goalService.ts          # CRUD goals, progress
│   │   ├── pomodoroService.ts      # Lưu phiên Pomodoro
│   │   ├── mindmapService.ts       # CRUD mind maps
│   │   ├── githubService.ts        # Upload ảnh lên GitHub
│   │   └── githubUploadService.ts  # Compress & upload media
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # User state, login/logout, needsOnboarding
│   │   └── LanguageContext.tsx     # i18n (vi/en), translations
│   │
│   ├── hooks/
│   │   ├── useSessionTimer.ts      # Đếm ngược thời gian phòng thi
│   │   └── useTabMonitor.ts        # Phát hiện thoát tab
│   │
│   ├── types/
│   │   └── session.ts              # TypeScript interfaces cho phòng thi
│   │
│   └── lib/
│       ├── firebase.ts             # Khởi tạo Firebase app, auth, db
│       └── utils.ts                # Helper functions (cn, cleanObject)
│
├── public/                         # Static assets
├── .env.local                      # Firebase config keys (không commit)
├── firebase.json                   # Firebase Hosting config
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Firestore composite indexes
├── next.config.ts                  # Next.js config (output: export khi production)
├── tailwind.config.ts              # Tailwind config, custom themes
└── package.json
```

---

## 5. Kết nối Firebase vào dự án

### Bước 1: Cài đặt dependencies

```bash
npx create-next-app@latest studyhub --typescript --tailwind --app
cd studyhub
npm install firebase next-themes framer-motion lucide-react
```

### Bước 2: Tạo file `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studyhub-2026.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studyhub-2026
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studyhub-2026.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

> **Lưu ý:** Thêm `.env.local` vào `.gitignore` để không commit key lên GitHub.

### Bước 3: Khởi tạo Firebase (`src/lib/firebase.ts`)

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Tránh khởi tạo nhiều lần trong Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

### Bước 4: Tạo AuthContext (`src/context/AuthContext.tsx`)

```typescript
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Bước 5: Wrap app với Providers (`src/app/providers.tsx`)

```typescript
"use client";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light">
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
```

---

## 6. Xây dựng từng chức năng

### 6.1 Xác thực & Onboarding

**Pattern:** `AuthContext` → `Login component` → `OnboardingModal`

1. `AuthContext` lắng nghe `onAuthStateChanged`, kiểm tra `onboardingCompleted` trong Firestore
2. Nếu user mới → set `needsOnboarding = true` → hiện `OnboardingModal`
3. Modal 2 bước: thông tin cá nhân → môn học quan tâm
4. Lưu vào `users/{uid}` với `onboardingCompleted: true`

```typescript
// userService.ts - pattern cơ bản
async updateStreak(uid, displayName, email, photoURL) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { uid, displayName, email, photoURL, streak: 1, lastLogin: Timestamp.now() });
    return 1;
  }
  // ... tính streak logic
}
```

### 6.2 Ghi chú (Notes)

**Pattern:** Realtime subscription với `onSnapshot`

```typescript
// noteService.ts
subscribeToNotes(userId, callback) {
  const q = query(collection(db, `users/${userId}/notes`), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
```

### 6.3 Flashcard với SRS

**Thuật toán SM-2:**
- `easeFactor` (mặc định 2.5): hệ số dễ nhớ
- `interval`: số ngày đến lần ôn tiếp theo
- `repetitions`: số lần đã ôn thành công

```typescript
// flashcardService.ts
calculateNextReview(card, quality) {
  // quality: 1=rất khó, 3=tạm, 4=dễ, 5=rất dễ
  if (quality >= 3) {
    nextInterval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor);
    nextRepetitions = repetitions + 1;
  } else {
    nextInterval = 1; nextRepetitions = 0; // reset
  }
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
}
```

### 6.4 Quiz Manager

**Luồng:**
1. Tạo `QuizSet` → thêm `Question[]` (text, options[4], correctAnswer index, imageUrl?)
2. Import CSV: `papaparse` parse → map sang `Question[]`
3. Làm bài: shuffle questions → hiển thị từng câu → submit → lưu `QuizResult`

### 6.5 Phòng thi chung (Shared Session)

**Luồng realtime:**

```
Host tạo session (status: 'waiting')
  → Firestore: quiz_sessions/{sessionId}
  → Hiển thị sessionCode 6 ký tự

Participant nhập mã → joinSession()
  → Query: where('sessionCode', '==', code)
  → Tạo participants/{userId} document

Host bấm "Bắt đầu" → startSession()
  → Update status: 'active'
  → onSnapshot notify tất cả participants

Participants làm bài
  → updateProgress() mỗi khi chuyển câu
  → useTabMonitor() phát hiện thoát tab
  → useSessionTimer() đếm ngược, auto-submit khi hết giờ

Host bấm "Kết thúc" → endSession()
  → Update status: 'finished'
  → Hiển thị LeaderboardView
```

**Key pattern — Realtime subscription:**
```typescript
// sessionService.ts
subscribeToSession(sessionId, callback) {
  return onSnapshot(doc(db, "quiz_sessions", sessionId), (snap) => {
    if (snap.exists()) callback({ sessionId: snap.id, ...snap.data() });
  });
}

subscribeToParticipants(sessionId, callback) {
  return onSnapshot(
    collection(db, "quiz_sessions", sessionId, "participants"),
    (snap) => callback(snap.docs.map(d => ({ userId: d.id, ...d.data() })))
  );
}
```

### 6.6 Cộng đồng

**Luồng:**
1. Fetch public `quizSets` và `flashcardSets` bằng `collectionGroup` query
2. Bài đăng: `community_posts` collection với subcollection `comments`
3. Clone bộ đề/thẻ: copy data sang `users/{uid}/quizSets` hoặc `flashcardSets`

### 6.7 Deploy lên Firebase Hosting

```bash
# Build production
npm run build

# Deploy
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

**`next.config.ts` cho static export:**
```typescript
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  ...(isProd ? { output: "export", trailingSlash: true } : {}),
};
```

**`firebase.json`:**
```json
{
  "hosting": {
    "public": "out",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

## Tóm tắt kiến trúc

```
Browser
  └── Next.js (React 19, TypeScript)
        ├── App Router (src/app/)
        ├── Components (src/components/)
        ├── Context (Auth, Language)
        └── Services (Firebase SDK)
              └── Firebase
                    ├── Authentication (Google OAuth)
                    └── Firestore (Realtime Database)
                          └── Hosting (Static Export)
```

> **Nguyên tắc thiết kế:**
> - Mỗi chức năng có service riêng trong `src/services/`
> - Tất cả Firestore operations đều qua service layer, không gọi trực tiếp từ component
> - Realtime data dùng `onSnapshot`, không polling
> - Security rules enforce ở cả service layer (check userId) và Firestore Rules
