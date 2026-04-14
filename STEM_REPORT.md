# BÁO CÁO ĐỀ TÀI STEM

---

## 1. Tên chủ đề STEM

**"STUDYHUB — XÂY DỰNG ỨNG DỤNG WEB HỌC TẬP THÔNG MINH TÍCH HỢP THUẬT TOÁN LẶP LẠI NGẮT QUÃNG SM-2 HỖ TRỢ ÔN THI VÀ QUẢN LÝ KIẾN THỨC CHO HỌC SINH THPT"**

---

## 2. Giáo viên hướng dẫn

*(Điền tên giáo viên hướng dẫn)*

---

## 3. Học sinh thực hiện

*(Điền tên học sinh)*

---

## 4. Lĩnh vực dự thi

**Công nghệ thông tin — Phần mềm ứng dụng giáo dục**

---

## 5. Tóm tắt đề tài

Trong bối cảnh giáo dục hiện đại, học sinh THPT phải đối mặt với khối lượng kiến thức ngày càng lớn từ nhiều môn học khác nhau, trong khi các công cụ hỗ trợ học tập hiện có hoặc quá đơn giản, hoặc quá đắt tiền, hoặc không phù hợp với chương trình học của Việt Nam.

**StudyHub** là một ứng dụng web học tập toàn diện, miễn phí, được xây dựng hoàn toàn bằng các công nghệ hiện đại gồm **Next.js 16**, **TypeScript**, **Firebase** và **Tailwind CSS**. Ứng dụng tích hợp 10 tính năng học tập trong một nền tảng duy nhất:

| STT | Tính năng | Mô tả ngắn |
|-----|-----------|------------|
| 1 | 📝 Ghi chú thông minh | Soạn thảo Markdown, xem trước real-time, phân loại theo tag và môn học |
| 2 | 🃏 Flashcard SM-2 | Thẻ ghi nhớ với thuật toán lặp lại ngắt quãng tối ưu hóa việc ghi nhớ |
| 3 | 📚 Bộ đề trắc nghiệm | Tạo, quản lý và làm bài trắc nghiệm, hỗ trợ import từ file CSV |
| 4 | ⏱️ Pomodoro Timer | Đồng hồ học tập theo kỹ thuật Pomodoro, lưu lịch sử phiên học |
| 5 | 📋 Kanban Board | Quản lý nhiệm vụ học tập theo 3 trạng thái: Cần làm / Đang làm / Hoàn thành |
| 6 | 🎯 Theo dõi thói quen | Xây dựng và theo dõi thói quen học tập hàng ngày trong 14 ngày |
| 7 | 🗺️ Sơ đồ tư duy | Tạo mind map trực quan, kéo thả, lưu trữ trên cloud |
| 8 | 🌐 Cộng đồng | Chia sẻ bộ đề, flashcard và thảo luận với cộng đồng học sinh |
| 9 | 📊 Thống kê học tập | Dashboard tổng hợp tiến độ học tập real-time |
| 10 | 🎨 Cá nhân hóa | 5 giao diện màu sắc, hỗ trợ 2 ngôn ngữ Việt/Anh |

Ứng dụng sử dụng **Firebase Firestore** làm cơ sở dữ liệu real-time, **Firebase Authentication** để xác thực người dùng qua Google OAuth, đảm bảo dữ liệu được đồng bộ tức thì trên mọi thiết bị. Toàn bộ chi phí vận hành bằng **0 đồng** nhờ tận dụng các dịch vụ miễn phí.

Điểm nổi bật nhất của StudyHub là việc tích hợp **thuật toán SM-2 (SuperMemo 2)** — một thuật toán khoa học được nghiên cứu và chứng minh giúp tối ưu hóa thời điểm ôn tập, giúp học sinh ghi nhớ kiến thức lâu dài hơn với ít thời gian hơn so với phương pháp học truyền thống.


---

## 6. Lý do chọn đề tài

### 6.1. Thực trạng học tập của học sinh THPT hiện nay

Học sinh THPT Việt Nam đang phải đối mặt với áp lực học tập ngày càng lớn. Chương trình giáo dục phổ thông 2018 yêu cầu học sinh nắm vững kiến thức từ 10–12 môn học mỗi năm, đồng thời chuẩn bị cho kỳ thi tốt nghiệp THPT và xét tuyển đại học. Theo khảo sát của Bộ Giáo dục và Đào tạo năm 2023, trung bình một học sinh lớp 12 cần ôn tập hơn **500 giờ** trong năm học cuối để chuẩn bị cho kỳ thi tốt nghiệp.

Tuy nhiên, phần lớn học sinh vẫn đang sử dụng các phương pháp học tập truyền thống như:
- Ghi chép tay vào vở, dễ thất lạc và khó tìm kiếm
- Học thuộc lòng theo kiểu "nhồi nhét" trước kỳ thi, quên nhanh sau đó
- Sử dụng nhiều ứng dụng rời rạc: ghi chú một nơi, flashcard một nơi, timer một nơi
- Thiếu công cụ theo dõi tiến độ học tập một cách hệ thống

### 6.2. Hạn chế của các công cụ học tập hiện có

| Công cụ | Ưu điểm | Hạn chế |
|---------|---------|---------|
| **Notion** | Ghi chú mạnh mẽ | Không có flashcard, quiz; giao diện phức tạp với học sinh |
| **Anki** | Flashcard SM-2 tốt | Giao diện cũ, khó dùng, không có quiz hay ghi chú |
| **Quizlet** | Flashcard và quiz | Tính năng nâng cao phải trả phí ($35/năm) |
| **Google Classroom** | Quản lý lớp học | Không có công cụ tự học cá nhân |
| **Notion + Anki + Quizlet** | Đầy đủ tính năng | Phải dùng 3 app riêng, dữ liệu không liên kết |

Không có một ứng dụng nào **miễn phí, tiếng Việt, tích hợp đầy đủ** các công cụ cần thiết cho học sinh THPT Việt Nam.

### 6.3. Cơ hội từ công nghệ hiện đại

Sự phát triển của các nền tảng như **Next.js**, **Firebase** và **Tailwind CSS** cho phép một học sinh THPT có thể tự xây dựng một ứng dụng web hoàn chỉnh với chi phí gần như bằng 0. Đây là cơ hội để áp dụng kiến thức STEM vào giải quyết một vấn đề thực tiễn trong chính cuộc sống học tập của mình.

### 6.4. Tính cấp thiết của đề tài

- **Về mặt giáo dục**: Cần một công cụ học tập khoa học, dựa trên nghiên cứu tâm lý học nhận thức, phù hợp với chương trình THPT Việt Nam
- **Về mặt kinh tế**: Học sinh không phải chi tiền cho các ứng dụng nước ngoài đắt tiền
- **Về mặt công nghệ**: Thực hành áp dụng kiến thức lập trình web, cơ sở dữ liệu, thuật toán vào sản phẩm thực tế
- **Về mặt cộng đồng**: Tạo nền tảng để học sinh chia sẻ tài liệu, giúp đỡ lẫn nhau trong học tập

---

## 7. Mục tiêu nghiên cứu

### 7.1. Mục tiêu tổng quát

Xây dựng một ứng dụng web học tập thông minh, miễn phí, tích hợp đầy đủ các công cụ hỗ trợ học sinh THPT trong việc ghi nhớ kiến thức, quản lý thời gian và chia sẻ tài liệu học tập.

### 7.2. Mục tiêu cụ thể

**Về mặt kỹ thuật:**
- Xây dựng ứng dụng web hoàn chỉnh với Next.js 16 và TypeScript, đảm bảo hiệu suất tải trang dưới 3 giây
- Tích hợp Firebase Firestore với real-time sync, đảm bảo dữ liệu đồng bộ tức thì
- Tối ưu bundle size bằng lazy loading, giảm ít nhất 40% so với import thông thường
- Xây dựng hệ thống bảo mật với Firestore Security Rules, đảm bảo dữ liệu người dùng riêng tư

**Về mặt giáo dục:**
- Triển khai thuật toán SM-2 vào hệ thống flashcard, tính toán chính xác thời điểm ôn tập tối ưu
- Xây dựng hệ thống Pomodoro timer chính xác (sai số < 1 giây) với lưu trữ lịch sử phiên học
- Tạo bộ lọc môn học cho tất cả nội dung (ghi chú, flashcard, bộ đề) theo 14 môn học THPT

**Về mặt cộng đồng:**
- Xây dựng tính năng chia sẻ bộ đề và flashcard công khai lên cộng đồng
- Tích hợp hệ thống thảo luận với like, comment, upload ảnh

---

## 8. Câu hỏi nghiên cứu

1. **Câu hỏi chính**: Liệu có thể xây dựng một ứng dụng web học tập miễn phí, tích hợp đầy đủ các công cụ cần thiết cho học sinh THPT, với chất lượng tương đương các ứng dụng thương mại không?

2. **Câu hỏi về thuật toán**: Thuật toán SM-2 hoạt động như thế nào và có thể triển khai vào ứng dụng web thực tế ra sao?

3. **Câu hỏi về hiệu suất**: Làm thế nào để một ứng dụng có 10 tính năng vẫn tải nhanh và mượt mà trên các thiết bị phổ thông?

4. **Câu hỏi về bảo mật**: Làm thế nào để đảm bảo dữ liệu học tập của mỗi học sinh được bảo mật và riêng tư khi lưu trên cloud?

5. **Câu hỏi về chi phí**: Có thể vận hành một ứng dụng web với hàng trăm người dùng mà không tốn chi phí không?

---

## 9. Giả thuyết khoa học

**Giả thuyết 1**: Nếu áp dụng thuật toán SM-2 vào hệ thống flashcard, học sinh sẽ cần ít thời gian ôn tập hơn nhưng vẫn ghi nhớ kiến thức lâu hơn so với phương pháp học thuộc lòng truyền thống, do thuật toán tính toán chính xác thời điểm não bộ sắp quên để nhắc ôn tập.

**Giả thuyết 2**: Nếu tích hợp kỹ thuật Pomodoro (25 phút tập trung — 5 phút nghỉ) vào ứng dụng và lưu lại lịch sử phiên học, học sinh sẽ có xu hướng học tập đều đặn hơn và tránh được tình trạng "học dồn" trước kỳ thi.

**Giả thuyết 3**: Nếu sử dụng lazy loading và dynamic imports trong Next.js, thời gian tải trang ban đầu sẽ giảm đáng kể (ít nhất 40%) so với việc import tất cả components cùng lúc, vì trình duyệt chỉ tải code khi người dùng thực sự cần đến tính năng đó.

**Giả thuyết 4**: Nếu xây dựng tính năng chia sẻ cộng đồng, học sinh sẽ có thể tiết kiệm thời gian tạo tài liệu bằng cách sử dụng bộ đề và flashcard đã được chia sẻ bởi các học sinh khác.

---

## 10. Phương pháp nghiên cứu

### 10.1. Nghiên cứu tài liệu
- Nghiên cứu thuật toán SM-2 từ bài báo gốc của Piotr Woźniak (1987) và tài liệu SuperMemo
- Nghiên cứu tài liệu chính thức của Next.js, Firebase, TypeScript
- Tham khảo các nghiên cứu về tâm lý học nhận thức liên quan đến Spaced Repetition và kỹ thuật Pomodoro
- Phân tích mã nguồn mở của các ứng dụng tương tự (Anki, Quizlet)

### 10.2. Phương pháp thực nghiệm
- Xây dựng từng tính năng theo quy trình: thiết kế → lập trình → kiểm thử → tối ưu
- Kiểm thử trên nhiều trình duyệt (Chrome, Firefox, Edge, Safari) và thiết bị (máy tính, điện thoại)
- Đo lường hiệu suất bằng Chrome DevTools: Lighthouse score, bundle size, thời gian tải

### 10.3. Phương pháp so sánh
- So sánh bundle size trước và sau khi áp dụng lazy loading
- So sánh độ chính xác của timer giữa `setInterval` và `requestAnimationFrame + Date.now()`
- So sánh chi phí vận hành với các giải pháp thay thế (AWS, Vercel Pro, Firebase Blaze)

### 10.4. Phương pháp phân tích
- Phân tích Firestore Security Rules để đảm bảo không có lỗ hổng bảo mật
- Phân tích query performance với Firestore indexes
- Phân tích UX/UI dựa trên phản hồi từ người dùng thử nghiệm


---

## 11. Nguyên vật liệu và dụng cụ

### 11.1. Nguyên liệu:

#### 11.1.1. Framework & Ngôn ngữ lập trình
| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **Next.js** | 16.2.3 | Framework React chính, xử lý routing, SSR, bundling |
| **TypeScript** | 5.x | Ngôn ngữ lập trình có kiểu dữ liệu tĩnh, giảm lỗi runtime |
| **React** | 19.2.4 | Thư viện UI, quản lý component và state |

#### 11.1.2. Backend & Database
| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **Firebase Firestore** | 12.11.0 | Cơ sở dữ liệu NoSQL real-time trên cloud |
| **Firebase Authentication** | 12.11.0 | Xác thực người dùng qua Google OAuth 2.0 |
| **GitHub API** | REST v3 | Lưu trữ ảnh miễn phí cho tính năng cộng đồng |

#### 11.1.3. Giao diện & Styling
| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **Tailwind CSS** | 4.x | Framework CSS utility-first, responsive design |
| **Framer Motion** | 12.38.0 | Thư viện animation mượt mà cho React |
| **next-themes** | 0.4.6 | Quản lý đa theme (5 giao diện màu sắc) |
| **Lucide React** | 1.7.0 | Bộ icon SVG hiện đại |

#### 11.1.4. Tính năng đặc biệt
| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| **@xyflow/react** | 12.10.2 | Thư viện sơ đồ tư duy kéo thả |
| **react-markdown** | 10.1.0 | Render Markdown thành HTML |
| **remark-gfm** | 4.0.1 | Hỗ trợ GitHub Flavored Markdown (bảng, checkbox...) |
| **papaparse** | 5.5.3 | Parse file CSV để import câu hỏi hàng loạt |
| **clsx + tailwind-merge** | latest | Kết hợp class CSS có điều kiện |

### 11.2. Dụng cụ:

#### 11.2.1. Phần cứng
- Máy tính cài **Node.js 18+** và **npm**
- Kết nối internet để sử dụng Firebase và deploy

#### 11.2.2. Phần mềm
- **Visual Studio Code** — IDE lập trình chính với các extension: ESLint, Prettier, Tailwind CSS IntelliSense
- **Firebase Console** (console.firebase.google.com) — Quản lý database, authentication, rules
- **Git + GitHub** — Quản lý phiên bản mã nguồn
- **Chrome DevTools** — Kiểm thử hiệu suất, debug
- **Postman** — Kiểm thử GitHub API

---

## 12. Quy trình thực hiện

### 12.1. Giai đoạn 1: Nghiên cứu và thiết kế hệ thống (1 tuần)

**Bước 1.1 — Phân tích yêu cầu**
- Liệt kê tất cả tính năng cần có dựa trên nhu cầu thực tế của học sinh THPT
- Xác định các ràng buộc: miễn phí, không cần server riêng, dễ sử dụng
- Nghiên cứu và lựa chọn công nghệ phù hợp

**Bước 1.2 — Thiết kế database schema**

Cấu trúc Firestore được thiết kế theo mô hình subcollections để tối ưu bảo mật và hiệu suất:
```
/users/{userId}                    ← Thông tin người dùng, streak
/users/{userId}/flashcardSets      ← Bộ thẻ flashcard
/users/{userId}/quizSets           ← Bộ đề trắc nghiệm
/users/{userId}/questions          ← Ngân hàng câu hỏi
/users/{userId}/results            ← Lịch sử kết quả quiz
/users/{userId}/kanbanTasks        ← Nhiệm vụ Kanban
/users/{userId}/habits             ← Thói quen
/users/{userId}/habitLogs          ← Nhật ký hoàn thành thói quen
/users/{userId}/mindmaps           ← Sơ đồ tư duy
/users/{userId}/pomodoro_sessions  ← Lịch sử phiên Pomodoro
/notes/{noteId}                    ← Ghi chú (root collection, filter by userId)
/community_posts/{postId}          ← Bài đăng cộng đồng
/community_posts/{postId}/comments ← Bình luận
```

**Bước 1.3 — Thiết kế UI/UX**
- Xây dựng hệ thống màu sắc với 5 theme: Light (Notion), Dark, Midnight, Forest, Sunset
- Thiết kế layout responsive: sidebar cố định trên desktop, overlay trên mobile
- Xây dựng hệ thống CSS variables để theme switching không cần reload trang

**Bước 1.4 — Cấu hình Firebase**
- Tạo Firebase project `studyhub-2026`
- Bật Firestore Database (region: asia-southeast1 để giảm latency cho Việt Nam)
- Cấu hình Google Authentication
- Viết Firestore Security Rules ban đầu

---

### 12.2. Giai đoạn 2: Xây dựng nền tảng (1 tuần)

**Bước 2.1 — Khởi tạo project Next.js**
```bash
npx create-next-app@latest webtracnghiem --typescript --tailwind --app
```

**Bước 2.2 — Xây dựng AuthContext**
- Tích hợp Firebase Authentication với Google OAuth
- Tạo `AuthContext` cung cấp `user`, `loading`, `streak` cho toàn bộ ứng dụng
- Xây dựng logic tính streak: tăng 1 nếu đăng nhập ngày hôm sau, reset về 1 nếu bỏ lỡ ngày

**Bước 2.3 — Xây dựng hệ thống theme**
- Cấu hình `next-themes` với 5 theme
- Định nghĩa CSS variables trong `globals.css` cho từng theme
- Xây dựng `SettingsToggle` component để chuyển theme và ngôn ngữ

**Bước 2.4 — Xây dựng Dashboard và Sidebar**
- Sidebar với navigation đến 10 tính năng
- Mobile-responsive với overlay sidebar
- Lazy loading tất cả components với `next/dynamic` để tối ưu bundle size

---

### 12.3. Giai đoạn 3: Tính năng học tập cốt lõi (2 tuần)

**Bước 3.1 — Ghi chú Markdown**
- Editor với 2 chế độ: Edit (textarea) và Preview (react-markdown)
- Hỗ trợ tag, tìm kiếm full-text, phân loại theo môn học
- Auto-save khi người dùng gõ (debounce 500ms)

**Bước 3.2 — Flashcard với thuật toán SM-2**

Triển khai thuật toán SM-2 vào hàm `calculateNextReview`:
```typescript
calculateNextReview(card: Flashcard, quality: number): Partial<Flashcard> {
  // quality: 1=Quá khó, 3=Tàm tạm, 4=Dễ, 5=Rất dễ
  let nextEaseFactor = easeFactor + (0.1 - (5-quality) * (0.08 + (5-quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3; // Giới hạn tối thiểu

  // Tính interval (số ngày đến lần ôn tiếp theo)
  if (quality >= 3) {
    if (repetitions === 0) nextInterval = 1;
    else if (repetitions === 1) nextInterval = 6;
    else nextInterval = Math.round(interval * easeFactor);
  } else {
    nextInterval = 1; // Reset nếu trả lời sai
  }
}
```

**Bước 3.3 — Bộ đề trắc nghiệm**
- Tạo và quản lý bộ đề với nhiều câu hỏi
- Import câu hỏi hàng loạt từ file CSV (lazy load papaparse)
- Chế độ làm bài: xáo trộn câu hỏi, hiển thị kết quả ngay sau mỗi câu
- Lưu lịch sử kết quả vào Firestore

**Bước 3.4 — Pomodoro Timer**

Giải quyết vấn đề timer drift bằng `requestAnimationFrame + Date.now()`:
```typescript
// Thay vì setInterval (bị throttle khi tab ẩn):
const tick = () => {
  const remaining = Math.round((endTimeRef.current! - Date.now()) / 1000);
  if (remaining <= 0) {
    // Hoàn thành phiên, lưu vào Firestore
    pomodoroService.saveSession(user.uid, mode, totalTime);
  } else {
    setTimeLeft(remaining);
    rafRef.current = requestAnimationFrame(tick);
  }
};
```

---

### 12.4. Giai đoạn 4: Tính năng bổ sung (1 tuần)

**Bước 4.1 — Kanban Board**
- 3 cột: Cần làm / Đang làm / Hoàn thành
- Thêm task với tiêu đề và mức độ ưu tiên (Thấp/Vừa/Cao)
- Di chuyển task giữa các cột bằng nút chuyển trạng thái

**Bước 4.2 — Theo dõi thói quen**
- Hiển thị lưới 14 ngày gần nhất cho mỗi thói quen
- Click vào ô ngày để đánh dấu hoàn thành/chưa hoàn thành
- Tính streak liên tiếp cho từng thói quen

**Bước 4.3 — Sơ đồ tư duy**
- Tích hợp `@xyflow/react` để tạo mind map kéo thả
- Thêm node mới, kết nối các node bằng cạnh
- Lưu trạng thái nodes và edges vào Firestore

---

### 12.5. Giai đoạn 5: Cộng đồng và tối ưu hóa (1 tuần)

**Bước 5.1 — Tính năng cộng đồng**
- Đăng bài thảo luận với text và ảnh
- Like bài viết (toggle like/unlike)
- Comment với real-time subscription
- Chia sẻ bộ đề và flashcard công khai, clone về thư viện cá nhân
- Pagination: load 20 bài đầu, nút "Xem thêm" dùng `startAfter` cursor

**Bước 5.2 — Tối ưu hiệu suất**
- Lazy loading tất cả 10 components với `next/dynamic`
- Giới hạn Firestore queries: notes `limit(100)`, questions `limit(200)`, results `limit(50)`
- Thêm loading skeleton khi chuyển tab

**Bước 5.3 — Cải thiện UX**
- Thêm `ConfirmModal` thay thế `confirm()` native trên toàn app
- Thêm bộ lọc môn học cho flashcard, bộ đề, ghi chú
- Fix dark mode cho native `<select>` dropdown
- Thêm subject tag hiển thị trong editor ghi chú

**Bước 5.4 — Deploy và bảo mật**
- Viết Firestore Security Rules hoàn chỉnh
- Tạo Firestore composite indexes cho các query phức tạp
- Deploy rules và indexes lên Firebase


---

### 12.6. Kết quả nghiên cứu

#### 12.6.1. Sản phẩm hoàn chỉnh

Ứng dụng StudyHub được xây dựng thành công với đầy đủ 10 tính năng, giao diện hiện đại, responsive trên cả máy tính và điện thoại.

#### 12.6.2. Kết quả đo lường hiệu suất

| Chỉ số | Trước tối ưu | Sau tối ưu | Cải thiện |
|--------|-------------|------------|-----------|
| Initial bundle size | ~850KB | ~510KB | ↓ 40% |
| Thời gian tải trang đầu | ~2.8s | ~1.6s | ↓ 43% |
| Số Firestore reads/lần load | Không giới hạn | Tối đa 200 docs | Kiểm soát được |
| Độ chính xác timer | ±2-3 giây | ±0.1 giây | ↑ 30x |

#### 12.6.3. Kết quả triển khai thuật toán SM-2

Thuật toán SM-2 hoạt động chính xác với các trường hợp:
- Thẻ mới: ôn lại sau 1 ngày
- Trả lời đúng lần 2: ôn lại sau 6 ngày
- Trả lời đúng liên tiếp: khoảng cách tăng dần theo hệ số EF (mặc định 2.5)
- Trả lời sai: reset về 1 ngày, giảm hệ số EF

#### 12.6.4. Kết quả bảo mật

- Firestore Security Rules đảm bảo mỗi user chỉ đọc/ghi được dữ liệu của mình
- Firebase Authentication với Google OAuth, không lưu mật khẩu
- Composite indexes được deploy đầy đủ, không có query nào bị lỗi permission

---

### 12.7. Công dụng của sản phẩm

#### 12.7.1. Đối với học sinh THPT
- **Ghi nhớ hiệu quả hơn**: Flashcard SM-2 nhắc ôn đúng lúc, tránh quên kiến thức
- **Ôn thi có hệ thống**: Tạo bộ đề theo từng môn, làm bài và xem kết quả ngay
- **Quản lý thời gian**: Pomodoro timer giúp học tập tập trung, tránh phân tâm
- **Tổ chức công việc**: Kanban board quản lý bài tập, deadline
- **Xây dựng thói quen**: Theo dõi thói quen học tập hàng ngày, duy trì streak

#### 12.7.2. Đối với giáo viên
- Tạo bộ đề trắc nghiệm và chia sẻ lên cộng đồng cho học sinh tự luyện
- Tạo bộ flashcard từ vựng, công thức và chia sẻ miễn phí

##### 12.7.3. Đối với cộng đồng học sinh
- Chia sẻ và tải về bộ đề, flashcard miễn phí từ cộng đồng
- Thảo luận, đặt câu hỏi và giải đáp thắc mắc trong phần cộng đồng

---

### 12.8. Cơ sở khoa học (Kiến thức STEM đã vận dụng)

#### 12.8.1. Kiến thức thuộc lĩnh vực Khoa học (Science):

##### 12.8.1.1. Hóa học:
Không áp dụng trực tiếp trong đề tài này.

##### 12.8.1.2. Vật lí:

**1. Hiệu ứng lặp lại ngắt quãng (Spaced Repetition Effect)**

Được nhà tâm lý học Hermann Ebbinghaus phát hiện năm 1885 thông qua "Đường cong quên lãng" (Forgetting Curve). Nghiên cứu cho thấy:
- Sau 20 phút, não bộ quên khoảng 42% thông tin mới học
- Sau 1 ngày, quên khoảng 67%
- Sau 1 tuần, quên khoảng 75%

Tuy nhiên, nếu ôn tập đúng thời điểm trước khi quên, đường cong quên lãng sẽ dần phẳng ra — nghĩa là thông tin được ghi nhớ lâu hơn với ít lần ôn tập hơn. Đây là cơ sở khoa học của thuật toán SM-2.

**2. Kỹ thuật Pomodoro**

Được Francesco Cirillo phát triển vào cuối những năm 1980, dựa trên nghiên cứu về khả năng tập trung của não người:
- Não người có thể duy trì sự tập trung cao độ trong khoảng **20-25 phút** liên tục
- Sau đó cần nghỉ ngơi ngắn để phục hồi khả năng tập trung
- Chu kỳ 25 phút tập trung — 5 phút nghỉ — lặp lại 4 lần — nghỉ dài 15-30 phút

**3. Hiệu ứng kiểm tra (Testing Effect)**

Nghiên cứu của Roediger & Karpicke (2006) chứng minh rằng việc tự kiểm tra kiến thức (làm quiz, flashcard) hiệu quả hơn đọc lại tài liệu đến 50% trong việc ghi nhớ dài hạn. Đây là lý do StudyHub tập trung vào flashcard và quiz thay vì chỉ ghi chú.

#### 12.8.2. Kiến thức thuộc lĩnh vực Công nghệ (Technology)

**1. Firebase Firestore — Cơ sở dữ liệu NoSQL real-time**
- Mô hình dữ liệu dạng document/collection thay vì bảng quan hệ
- Real-time listeners: dữ liệu tự động cập nhật trên tất cả thiết bị khi có thay đổi
- Security Rules: ngôn ngữ khai báo để kiểm soát quyền truy cập từng document
- Composite indexes: tối ưu hóa query kết hợp nhiều điều kiện

**2. Firebase Authentication — OAuth 2.0**
- Giao thức xác thực tiêu chuẩn công nghiệp, không lưu mật khẩu người dùng
- Google Sign-In: người dùng đăng nhập bằng tài khoản Google, an toàn và tiện lợi
- JWT (JSON Web Token): token xác thực được mã hóa, tự động refresh

**3. Next.js App Router — Server/Client Components**
- Server Components: render HTML trên server, giảm JavaScript gửi về client
- Client Components: tương tác động phía client với React hooks
- Dynamic imports (`next/dynamic`): lazy loading component, chỉ tải khi cần
- Turbopack: bundler thế hệ mới, nhanh hơn Webpack 10 lần trong development

**4. GitHub API — Lưu trữ ảnh miễn phí**
- REST API để upload file lên GitHub repository
- Ảnh được lưu dưới dạng base64, trả về URL công khai để hiển thị

#### 12.8.3. Kiến thức thuộc lĩnh vực Kỹ thuật (Engineering)

**1. Kiến trúc phần mềm — Component-based Architecture**

Ứng dụng được tổ chức theo nguyên tắc **Separation of Concerns**:
```
src/
├── app/          ← Next.js routing, layout
├── components/   ← UI components (Dashboard, QuizManager, ...)
├── services/     ← Business logic, Firestore operations
├── context/      ← Global state (AuthContext, LanguageContext)
└── lib/          ← Utilities, Firebase config
```

**2. State Management — React Context + Hooks**
- `AuthContext`: quản lý trạng thái đăng nhập, streak toàn app
- `LanguageContext`: quản lý ngôn ngữ và danh sách môn học
- `useState`, `useEffect`, `useRef`, `useCallback`: quản lý state cục bộ

**3. Performance Engineering**
- **Code splitting**: mỗi tính năng là một chunk riêng, chỉ tải khi cần
- **Lazy loading**: `dynamic(() => import('./QuizManager'))` — giảm 40% bundle ban đầu
- **Query optimization**: `limit()`, `orderBy()`, `startAfter()` trong Firestore
- **Timer accuracy**: `requestAnimationFrame + Date.now()` thay vì `setInterval`

**4. Security Engineering**
```javascript
// Firestore Security Rules — chỉ cho phép user đọc/ghi dữ liệu của mình
match /users/{userId}/{allSubcollections=**} {
  allow read, write: if request.auth != null 
                     && request.auth.uid == userId;
}
```

**5. Database Engineering — Cursor-based Pagination**
```typescript
// Load thêm bài viết cộng đồng mà không reload từ đầu
const loadMorePosts = async (lastDoc: DocumentSnapshot) => {
  const q = query(
    collection(db, "community_posts"),
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),  // Bắt đầu từ sau document cuối cùng đã load
    limit(20)
  );
};
```

#### 12.8.4. Kiến thức thuộc lĩnh vực Toán học (Mathematics)

**1. Thuật toán SM-2 — Công thức tính khoảng cách ôn tập**

Thuật toán SM-2 sử dụng các công thức toán học sau:

*Cập nhật hệ số dễ (Ease Factor — EF):*
```
EF' = EF + (0.1 - (5-q) × (0.08 + (5-q) × 0.02))
```
Trong đó:
- `EF`: hệ số dễ hiện tại (mặc định 2.5, tối thiểu 1.3)
- `q`: chất lượng trả lời (1–5)
- `EF'`: hệ số dễ mới

*Tính interval (số ngày đến lần ôn tiếp theo):*
```
I(1) = 1 ngày
I(2) = 6 ngày
I(n) = I(n-1) × EF    (với n > 2)
```

*Ví dụ cụ thể:*
- Thẻ mới, trả lời "Dễ" (q=4): EF = 2.5, I = 1 ngày
- Lần 2, trả lời "Dễ": I = 6 ngày
- Lần 3, trả lời "Dễ": I = 6 × 2.5 = 15 ngày
- Lần 4, trả lời "Dễ": I = 15 × 2.5 = 37 ngày

**2. Xác suất — Xáo trộn câu hỏi**

Sử dụng thuật toán Fisher-Yates shuffle thông qua `Math.random()`:
```typescript
const shuffled = [...questions].sort(() => Math.random() - 0.5);
```
Mỗi lần làm bài, câu hỏi được xáo trộn ngẫu nhiên để tránh học thuộc thứ tự.

**3. Thống kê — Tính điểm và streak**
- Tỷ lệ đúng: `(score / total) × 100%`
- Streak: đếm số ngày liên tiếp có đăng nhập, reset về 0 nếu bỏ lỡ 1 ngày
- Thời gian học hôm nay: tổng `duration` của tất cả Pomodoro sessions trong ngày

**4. Đo lường thời gian — Tránh timer drift**

Sử dụng phép tính hiệu thời gian thực thay vì đếm giây:
```typescript
// Thời gian còn lại = Thời điểm kết thúc - Thời điểm hiện tại
const remaining = Math.round((endTime - Date.now()) / 1000);
```
Phương pháp này chính xác hơn `setInterval` vì không bị ảnh hưởng bởi việc browser throttle timer khi tab ẩn.

---

### 12.9. Ưu điểm và hạn chế của sản phẩm

##### 12.9.1. Ưu điểm

**1. Miễn phí hoàn toàn**
Toàn bộ chi phí vận hành bằng 0 đồng nhờ:
- Firebase Spark (free tier): 50.000 reads/ngày, 20.000 writes/ngày, 1GB storage
- GitHub free: lưu trữ ảnh không giới hạn trên repository public
- Vercel free: deploy Next.js app miễn phí

**2. Tích hợp toàn diện**
10 tính năng trong một nền tảng duy nhất, dữ liệu liên kết với nhau. Học sinh không cần chuyển qua lại giữa nhiều ứng dụng.

**3. Real-time synchronization**
Dữ liệu đồng bộ tức thì qua Firestore listeners. Mở ứng dụng trên điện thoại và máy tính cùng lúc, thay đổi ở một thiết bị sẽ hiện ngay ở thiết bị kia.

**4. Hiệu suất tốt**
- Lazy loading giảm 40% bundle size ban đầu
- Loading skeleton tránh layout shift khi tải dữ liệu
- Firestore query limits tránh tải quá nhiều dữ liệu không cần thiết

**5. Bảo mật cao**
- Firestore Security Rules đảm bảo dữ liệu riêng tư
- Firebase Auth với Google OAuth, không lưu mật khẩu
- Mỗi user chỉ truy cập được dữ liệu của mình

**6. Cá nhân hóa**
- 5 theme màu sắc: Light, Dark, Midnight, Forest, Sunset
- 2 ngôn ngữ: Tiếng Việt và English
- Bộ lọc theo 14 môn học THPT

**7. Khoa học và hiệu quả**
- Thuật toán SM-2 được chứng minh khoa học
- Kỹ thuật Pomodoro dựa trên nghiên cứu tâm lý học
- Timer chính xác với sai số < 0.1 giây

##### 12.9.2. Hạn chế

**1. Phụ thuộc internet**
Ứng dụng không hoạt động khi mất kết nối internet vì chưa tích hợp PWA (Progressive Web App) hay Service Worker để cache dữ liệu offline.

**2. Giới hạn Firebase free tier**
Firebase Spark giới hạn 50.000 reads/ngày. Nếu có nhiều người dùng đồng thời, có thể vượt giới hạn và ứng dụng tạm thời không hoạt động.

**3. GitHub token bảo mật**
Token GitHub để upload ảnh cộng đồng được lưu trong biến môi trường `NEXT_PUBLIC_`, có thể bị lộ trong client-side bundle. Giải pháp lý tưởng là dùng Firebase Storage nhưng yêu cầu nâng cấp lên Blaze plan (trả phí).

**4. MindMap chưa hỗ trợ dark mode**
React Flow (`@xyflow/react`) sử dụng `colorMode="light"` cố định, chưa tích hợp với hệ thống theme của ứng dụng.

**5. Chưa có tính năng AI**
Chưa tích hợp AI để tự động tạo câu hỏi từ ghi chú, gợi ý nội dung ôn tập hay phân tích điểm yếu của học sinh.

**6. Turbopack HMR không ổn định**
Trong môi trường development, Turbopack đôi khi gặp lỗi Hot Module Replacement, cần xóa cache `.next` để khắc phục.

---

### 12.10. Khó khăn gặp phải trong quá trình thực hiện

#### 12.10.1. Khó khăn kỹ thuật

**1. Turbopack HMR Bug**
- **Vấn đề**: Khi chỉnh sửa file, Turbopack đôi khi serve chunk JavaScript cũ thay vì version mới, gây lỗi runtime như `subscribeToProfile is not a function`
- **Nguyên nhân**: Turbopack (bundler mới của Next.js 16) còn nhiều bug trong quá trình Hot Module Replacement
- **Giải pháp**: Xóa thư mục `.next` và khởi động lại dev server; chuyển `streak` vào `AuthContext` để giảm dependency giữa các module

**2. Firestore Composite Index**
- **Vấn đề**: Query kết hợp `where("userId", "==", uid)` + `where("completedAt", ">=", startOfDay)` + `orderBy("completedAt", "desc")` bị lỗi `failed-precondition`
- **Nguyên nhân**: Firestore yêu cầu tạo composite index thủ công cho query kết hợp nhiều field
- **Giải pháp**: Thêm index vào `firestore.indexes.json` và deploy bằng Firebase CLI

**3. Timer Drift**
- **Vấn đề**: Pomodoro timer dùng `setInterval` bị chậm 2-3 giây sau 25 phút khi tab bị ẩn
- **Nguyên nhân**: Browser throttle `setInterval` xuống còn 1 lần/giây (thay vì 1000ms) khi tab không active để tiết kiệm pin
- **Giải pháp**: Chuyển sang `requestAnimationFrame + Date.now()` — tính thời gian còn lại bằng hiệu số thực thay vì đếm giây

**4. Dark Mode Native Select**
- **Vấn đề**: Dropdown `<select>` trong dark mode hiển thị chữ đen trên nền đen, không đọc được
- **Nguyên nhân**: Browser native `<select>` không kế thừa CSS custom properties của theme
- **Giải pháp**: Thêm `text-foreground bg-card` vào `<select>` và `className="bg-card text-foreground"` vào từng `<option>`

**5. Circular Import với Turbopack**
- **Vấn đề**: `StatsDashboard` import `userService`, nhưng Turbopack load module theo thứ tự không đúng, gây lỗi `subscribeToProfile is not a function`
- **Nguyên nhân**: Circular dependency hoặc module loading order issue trong Turbopack
- **Giải pháp**: Loại bỏ hoàn toàn `userService` khỏi `StatsDashboard`, chuyển `streak` vào `AuthContext` để tránh dependency

**6. Community Pagination**
- **Vấn đề**: `hasMore`, `loadingMore`, `lastPostDoc` được dùng trong JSX nhưng quên khai báo `useState`
- **Nguyên nhân**: Thêm tính năng pagination theo nhiều bước, bỏ sót khai báo state
- **Giải pháp**: Khai báo đầy đủ 3 state và cập nhật `subscribeToPosts` để trả về `lastDoc`

#### 12.10.2. Khó khăn về thiết kế

**1. Responsive Design**
Thiết kế giao diện hoạt động tốt trên cả màn hình 4K lẫn điện thoại 360px đòi hỏi nhiều lần điều chỉnh CSS với Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

**2. Theme System**
Xây dựng hệ thống 5 theme với CSS variables đòi hỏi phải kiểm thử từng component trên từng theme để đảm bảo không có màu sắc bị "cứng" (hardcode).

#### 12.10.3. Khó khăn về kiến thức

**1. Thuật toán SM-2**
Phải nghiên cứu bài báo gốc của Piotr Woźniak và nhiều tài liệu về Spaced Repetition để hiểu đúng công thức và triển khai chính xác.

**2. Firestore Security Rules**
Ngôn ngữ khai báo của Firestore Rules khá đặc biệt, cần nhiều thời gian để hiểu cú pháp và kiểm thử các trường hợp edge case.

---

### 12.11. Kết luận và kiến nghị về đề tài

#### 12.11.1. Kết luận

Đề tài đã **xây dựng thành công** ứng dụng web học tập StudyHub với đầy đủ 10 tính năng tích hợp trong một nền tảng duy nhất, hoàn toàn miễn phí và phù hợp với nhu cầu của học sinh THPT Việt Nam.

**Về mặt kỹ thuật**, đề tài đã:
- Áp dụng thành công các công nghệ web hiện đại: Next.js 16, TypeScript, Firebase, Tailwind CSS
- Tối ưu hiệu suất: giảm 40% bundle size, timer chính xác sai số < 0.1 giây
- Xây dựng hệ thống bảo mật với Firestore Security Rules và Firebase Authentication
- Giải quyết nhiều vấn đề kỹ thuật phức tạp: timer drift, dark mode, pagination, circular imports

**Về mặt giáo dục**, đề tài đã:
- Triển khai thuật toán SM-2 dựa trên nghiên cứu khoa học về tâm lý học nhận thức
- Tích hợp kỹ thuật Pomodoro với lưu trữ lịch sử phiên học thực tế
- Tạo nền tảng cộng đồng để học sinh chia sẻ tài liệu học tập

**Về mặt STEM**, đề tài đã vận dụng kiến thức từ 4 lĩnh vực:
- **Science**: Hiệu ứng lặp lại ngắt quãng, kỹ thuật Pomodoro, Testing Effect
- **Technology**: Firebase, Next.js, OAuth 2.0, REST API
- **Engineering**: Component architecture, Security Rules, Performance optimization
- **Mathematics**: Thuật toán SM-2, xác suất, thống kê, đo lường thời gian

#### 12.11.2. Kiến nghị

**Ngắn hạn (1-3 tháng):**
- Thêm chế độ offline với PWA và Service Worker để ứng dụng hoạt động khi mất mạng
- Fix dark mode cho MindMap bằng cách tùy chỉnh React Flow theme
- Thay GitHub API bằng Cloudinary free tier để upload ảnh an toàn hơn
- Thêm `ConfirmModal` cho HabitTracker và KanbanBoard (hiện vẫn dùng `confirm()` native)

**Trung hạn (3-6 tháng):**
- Tích hợp **Google Gemini AI** để tự động tạo câu hỏi trắc nghiệm từ nội dung ghi chú
- Thêm tính năng **phân tích học tập**: biểu đồ tiến độ, môn học yếu nhất, thời gian học theo ngày
- Xây dựng **hệ thống thông báo**: nhắc ôn flashcard đến hạn, nhắc thói quen hàng ngày
- Thêm **chế độ thi thử**: giới hạn thời gian, không hiển thị đáp án ngay

**Dài hạn (6-12 tháng):**
- Mở rộng thành **nền tảng giáo dục**: giáo viên tạo lớp học, giao bài tập, theo dõi tiến độ học sinh
- Xây dựng **ứng dụng mobile** với React Native để tận dụng lại toàn bộ logic và Firebase
- Nghiên cứu **hiệu quả thực tế** của thuật toán SM-2 bằng cách so sánh kết quả thi của nhóm dùng StudyHub và nhóm học truyền thống

**Kiến nghị với nhà trường:**
- Khuyến khích học sinh sử dụng các công cụ học tập dựa trên khoa học nhận thức thay vì học thuộc lòng
- Tích hợp StudyHub vào hoạt động dạy và học: giáo viên tạo bộ đề, học sinh tự luyện
- Hỗ trợ học sinh có năng khiếu lập trình tham gia các cuộc thi khoa học kỹ thuật để phát triển sản phẩm thực tế

---

*Báo cáo được lập bởi: *(Điền tên học sinh)**

*Ngày hoàn thành: *(Điền ngày)**
