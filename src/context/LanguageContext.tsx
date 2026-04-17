"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "vi" | "en";

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Common
  dashboard: { vi: "Tổng quan", en: "Dashboard" },
  notes: { vi: "Ghi chú", en: "Notes" },
  flashcards: { vi: "Flashcards", en: "Flashcards" },
  quizzes: { vi: "Bài kiểm tra", en: "Quizzes" },
  pomodoro: { vi: "Pomodoro", en: "Pomodoro" },
  settings: { vi: "Cài đặt", en: "Settings" },
  logout: { vi: "Đăng xuất", en: "Logout" },
  search: { vi: "Tìm kiếm...", en: "Search..." },
  new_note: { vi: "Tạo ghi chú mới", en: "New Note" },
  save: { vi: "Lưu", en: "Save" },
  cancel: { vi: "Hủy", en: "Cancel" },
  delete_confirm: { vi: "Bạn có chắc chắn muốn xóa không?", en: "Are you sure you want to delete this?" },
  
  // Dashboard
  welcome: { vi: "Chào mừng trở lại", en: "Welcome back" },
  morning_prompt: { vi: "Hôm nay bạn muốn học thêm điều gì mới?", en: "What would you like to learn today?" },
  total_notes: { vi: "Tổng ghi chú", en: "Total Notes" },
  due_cards: { vi: "Cần ôn tập", en: "Due Cards" },
  avg_score: { vi: "Điểm Quiz TB", en: "Avg Score" },
  streak: { vi: "Chuỗi học tập", en: "Study Streak" },
  recent_notes: { vi: "Ghi chú gần đây", en: "Recent Notes" },
  view_all: { vi: "Tất cả", en: "View All" },
  ready_prompt: { vi: "Sẵn sàng chưa?", en: "Ready to study?" },
  study_now: { vi: "Học ngay", en: "Study Now" },
  quiz_results: { vi: "Kết quả Quiz", en: "Quiz Results" },
  days: { vi: "Ngày", en: "Days" },
  learning: { vi: "Đang học", en: "Learning" },
  no_notes_yet: { vi: "Chưa có ghi chú nào.", en: "No notes yet." },
  no_quiz_results: { vi: "Chưa tham gia kiểm tra.", en: "No quiz results yet." },
  correct_answers: { vi: "Câu đúng", en: "Correct answers" },
  
  // Editor
  select_note: { vi: "Chọn một bản ghi", en: "Select a note" },
  select_note_prompt: { vi: "Bắt đầu học ngay bằng cách chọn ghi chú từ cột bên trái.", en: "Select a note from the sidebar to start learning." },
  edit_mode: { vi: "Chế độ sửa", en: "Edit Mode" },
  preview_mode: { vi: "Xem trước", en: "Preview" },
  untitled: { vi: "Chưa đặt tiêu đề", en: "Untitled" },
  add_tag: { vi: "Thêm Tag", en: "Add Tag" },
  content_placeholder: { vi: "Bắt đầu viết những điều thú vị ở đây...", en: "Start writing something interesting here..." },

  // Flashcards
  flashcards_title: { vi: "Flashcards", en: "Flashcards" },
  flashcard_due: { vi: "thẻ cần ôn tập", en: "cards due for review" },
  create_card: { vi: "Tạo thẻ", en: "Create Card" },
  question_front: { vi: "Mặt trước (Câu hỏi)", en: "Front (Question)" },
  question_back: { vi: "Mặt sau (Trả lời)", en: "Back (Answer)" },
  save_card: { vi: "Lưu thẻ", en: "Save Card" },
  question_placeholder: { vi: "Câu hỏi là gì...?", en: "What is...?" },
  answer_placeholder: { vi: "Trả lời là...", en: "It is..." },
  no_flashcards: { vi: "Chưa có flashcard nào. Hãy tạo cái đầu tiên để bắt đầu học!", en: "No flashcards yet. Create your first one to start learning!" },
  review_complete: { vi: "Hoàn thành ôn tập!", en: "Review Complete!" },
  review_complete_desc: { vi: "Bạn đã hoàn thành tất cả các thẻ cho lúc này. Quay lại sau nhé.", en: "You've finished all your cards for now. Come back later for more." },
  back_to_dashboard: { vi: "Quay lại Tổng quan", en: "Back to Dashboard" },
  score_again: { vi: "Lặp lại", en: "Again" },
  score_hard: { vi: "Khó", en: "Hard" },
  score_good: { vi: "Tốt", en: "Good" },
  score_easy: { vi: "Dễ", en: "Easy" },
  flip_prompt: { vi: "Nhấn để lật", en: "Click to flip" },
  question_label: { vi: "Câu hỏi", en: "Question" },
  answer_label: { vi: "Trả lời", en: "Answer" },

  // Quiz
  quizzes_title: { vi: "Bài kiểm tra", en: "Quizzes" },
  question_bank: { vi: "Ngân hàng câu hỏi", en: "Question Bank" },
  history: { vi: "Lịch sử", en: "History" },
  database: { vi: "Cơ sở dữ liệu", en: "Database" },
  import_csv: { vi: "Nhập từ CSV", en: "Import CSV" },
  csv_sample_download: { vi: "Tải mẫu CSV", en: "Download CSV sample" },
  flashcards_csv_help: { vi: "CSV cần chứa cột front/back hoặc question/answer.", en: "CSV should contain front/back or question/answer columns." },
  quiz_csv_help: { vi: "CSV cần chứa question,option1,option2,option3,option4,correct.", en: "CSV should contain question,option1,option2,option3,option4,correct columns." },
  add_question: { vi: "Thêm câu hỏi", en: "Add Question" },
  start_quiz: { vi: "Bắt đầu Quiz", en: "Start Quiz" },
  enter_question: { vi: "Nhập câu hỏi của bạn ở đây...", en: "Enter your question here..." },
  option: { vi: "Lựa chọn", en: "Option" },
  save_question: { vi: "Lưu câu hỏi", en: "Save Question" },
  correct: { vi: "Đúng", en: "Correct" },
  no_history: { vi: "Chưa có lịch sử kiểm tra.", en: "No test history yet." },
  quiz_finished: { vi: "Kết thúc Quiz!", en: "Quiz Finished!" },
  your_score: { vi: "Điểm của bạn:", en: "Your score:" },
  close_quiz: { vi: "Đóng Quiz", en: "Close Quiz" },
  next_question: { vi: "Câu tiếp theo", en: "Next Question" },
  get_results: { vi: "Xem kết quả", en: "Get Results" },
  question_num: { vi: "Câu hỏi", en: "Question" },
  of: { vi: "trên", en: "of" },

  // Pomodoro
  pomodoro_title: { vi: "Pomodoro", en: "Pomodoro" },
  pomodoro_desc: { vi: "Tập trung vào việc học của bạn, từng phiên một.", en: "Focus on your studies, one session at a time." },
  focus: { vi: "Tập trung", en: "Focus" },
  short_break: { vi: "Nghỉ ngắn", en: "Short Break" },
  long_break: { vi: "Nghỉ dài", en: "Long Break" },
  pause: { vi: "Tạm dừng", en: "Pause" },
  start_focus: { vi: "Bắt đầu", en: "Start Focus" },
  daily_goal: { vi: "Mục tiêu hàng ngày", en: "Daily Goal" },
  time_studied: { vi: "Thời gian đã học", en: "Time Studied" },

  // Login
  login_title: { vi: "StudyNotes", en: "StudyNotes" },
  login_subtitle: { vi: "Bộ não thứ hai để tối ưu hóa việc học tập của bạn.", en: "Your second brain for organized learning." },
  login_with_google: { vi: "Tiếp tục với Google", en: "Continue with Google" },
  login_footer: { vi: "Bắt đầu ghi lại ý tưởng và sắp xếp việc học của bạn ngay hôm nay. Miễn phí cho cá nhân.", en: "Start capturing your thoughts and organizing your studies today. Free for individuals." },

  // Settings
  themes: { vi: "Chủ đề", en: "Themes" },
  language: { vi: "Ngôn ngữ", en: "Language" },
  tags_label: { vi: "THẺ", en: "TAGS" },
  study_streak_desc: { vi: "Ôn tập Flashcard mỗi ngày giúp bạn ghi nhớ lâu hơn 80% kiến thức đã học.", en: "Reviewing Flashcards daily helps you remember 80% more of what you've learned." },

  // Navigation
  community: { vi: "Cộng đồng", en: "Community" },
  kanban: { vi: "Nhiệm vụ", en: "Tasks" },
  habits: { vi: "Thói quen", en: "Habits" },
  goals: { vi: "Mục tiêu", en: "Goals" },
  mindmap: { vi: "Sơ đồ", en: "Mind Map" },
  join_room: { vi: "Tham gia phòng thi", en: "Join Quiz Room" },

  // Profile / Settings panel
  profile: { vi: "Hồ sơ", en: "Profile" },
  display_name: { vi: "Tên hiển thị", en: "Display Name" },
  age: { vi: "Tuổi", en: "Age" },
  grade: { vi: "Lớp / Cấp học", en: "Grade" },
  subjects_interest: { vi: "Môn học quan tâm", en: "Subjects of Interest" },
  save_changes: { vi: "Lưu thay đổi", en: "Save Changes" },
  saved: { vi: "Đã lưu", en: "Saved" },
  saving: { vi: "Đang lưu...", en: "Saving..." },

  // Dashboard stats
  active_status: { vi: "Đang hoạt động", en: "Active" },
  quiz_set_count: { vi: "Bộ đề", en: "Quiz Sets" },

  // Quiz Manager
  back_to_sets: { vi: "Quay lại danh sách bộ đề", en: "Back to Quiz Sets" },
  create_set: { vi: "Tạo bộ đề", en: "Create Set" },
  all_subjects: { vi: "Tất cả môn", en: "All Subjects" },
  no_sets: { vi: "Chưa có bộ đề nào. Hãy tạo bộ đề đầu tiên!", en: "No quiz sets yet. Create your first one!" },
  shuffle_on: { vi: "Xáo trộn: Bật", en: "Shuffle: On" },
  shuffle_off: { vi: "Xáo trộn: Tắt", en: "Shuffle: Off" },
  start_quiz_btn: { vi: "Bắt đầu làm bài", en: "Start Quiz" },
  update_btn: { vi: "Cập nhật", en: "Update" },
  empty_set: { vi: "Bộ đề trống. Hãy bắt đầu thêm câu hỏi!", en: "Empty set. Start adding questions!" },
  check_knowledge: { vi: "Kiểm tra kiến thức", en: "Check Knowledge" },
  sharing: { vi: "Đang chia sẻ", en: "Sharing" },
  share_community: { vi: "Chia sẻ lên cộng đồng", en: "Share to Community" },
  question_count: { vi: "câu hỏi", en: "questions" },
  no_description: { vi: "Không có mô tả cho bộ đề này.", en: "No description for this quiz set." },
  question_list_count: { vi: "Danh sách câu hỏi", en: "Question List" },
  sets_tab: { vi: "Bộ đề", en: "Sets" },
  bank_tab: { vi: "Ngân hàng", en: "Bank" },
  database_count: { vi: "Cơ sở dữ liệu", en: "Database" },
  quiz_result_title: { vi: "Kết quả kiểm tra", en: "Quiz Result" },
  back_to_history: { vi: "Quay lại lịch sử", en: "Back to History" },
  accuracy_rate: { vi: "Tỷ lệ", en: "Accuracy" },
  detail_per_question: { vi: "Chi tiết từng câu", en: "Question Details" },
  your_answer: { vi: "Câu trả lời của bạn", en: "Your Answer" },
  correct_answer_label: { vi: "Câu trả lời đúng", en: "Correct Answer" },
  question_content: { vi: "Nội dung câu hỏi", en: "Question Content" },
  question_placeholder_text: { vi: "Nhập câu hỏi của bạn...", en: "Enter your question..." },
  option_label: { vi: "Phương án", en: "Option" },
  create_set_name_placeholder: { vi: "Tên bộ đề trắc nghiệm...", en: "Quiz set name..." },
  create_set_desc_placeholder: { vi: "Mô tả phạm vi kiến thức...", en: "Describe the knowledge scope..." },
  select_subject: { vi: "Chọn môn học", en: "Select Subject" },
  create_now: { vi: "Tạo ngay", en: "Create Now" },

  // Community
  community_hub: { vi: "Trung tâm cộng đồng", en: "Community Hub" },
  community_tagline: { vi: "Kết nối tri thức, Cùng nhau tiến bộ", en: "Connect Knowledge, Progress Together" },
  community_search_placeholder: { vi: "Tìm kiếm bộ đề, thảo luận hoặc tác giả...", en: "Search quiz sets, discussions or authors..." },
  discussion_tab: { vi: "Thảo luận", en: "Discussion" },
  quiz_sets_tab: { vi: "Bộ đề Quiz", en: "Quiz Sets" },
  flashcard_tab: { vi: "Flashcard", en: "Flashcard" },
  create_post_placeholder: { vi: "Bạn đang nghĩ gì? Chia sẻ ngay với mọi người...", en: "What's on your mind? Share with everyone..." },
  create_discussion_title: { vi: "Tạo bài thảo luận mới", en: "Create New Discussion" },
  post_content_placeholder: { vi: "Đặt câu hỏi hoặc chia sẻ kiến thức của bạn...", en: "Ask a question or share your knowledge..." },
  add_image: { vi: "+ Thêm ảnh", en: "+ Add Image" },
  post_now: { vi: "Đăng bài ngay", en: "Post Now" },
  processing: { vi: "Đang xử lý...", en: "Processing..." },
  no_content: { vi: "Hiện chưa có nội dung nào được chia sẻ", en: "No content shared yet" },
  author_label: { vi: "Tác giả", en: "Author" },
  save_to_library: { vi: "Lưu về", en: "Save" },
  replies: { vi: "phản hồi", en: "replies" },
  load_more: { vi: "Xem thêm thảo luận", en: "Load More" },
  loading_data: { vi: "Đang tải dữ liệu...", en: "Loading..." },
  comment_placeholder: { vi: "Nhập phản hồi của bạn...", en: "Enter your reply..." },
  questions_label: { vi: "câu hỏi", en: "questions" },
  cards_label: { vi: "thẻ ghi nhớ", en: "flashcards" },

  // Kanban
  task_manager_title: { vi: "Trình quản lý nhiệm vụ", en: "Task Manager" },
  task_manager_subtitle: { vi: "Quản lý việc học thông minh hơn", en: "Manage your studies smarter" },
  productivity_dashboard: { vi: "Nâng cao năng suất học tập", en: "Boost your learning productivity" },
  todo_col: { vi: "Cần làm", en: "To Do" },
  doing_col: { vi: "Đang làm", en: "In Progress" },
  done_col: { vi: "Hoàn thành", en: "Done" },
  low_priority: { vi: "Thấp", en: "Low" },
  medium_priority: { vi: "Vừa", en: "Medium" },
  high_priority: { vi: "Cao", en: "High" },
  task_name_placeholder: { vi: "Tên nhiệm vụ...", en: "Task name..." },
  recently: { vi: "Mới đây", en: "Recently" },

  // Habit Tracker
  habit_tracker_title: { vi: "Theo dõi thói quen", en: "Habit Tracker" },
  habit_tracker_tagline: { vi: "Kỷ luật là sức mạnh", en: "Discipline is Power" },
  habit_tracker_subtitle: { vi: "Xây dựng tương lai qua thói quen", en: "Build your future through habits" },
  create_habit: { vi: "Tạo thói quen mới", en: "Create New Habit" },
  habit_name_placeholder: { vi: "Tên thói quen (vd: Đọc sách, Chạy bộ...)", en: "Habit name (e.g. Read, Run...)" },
  choose_color: { vi: "Chọn màu sắc", en: "Choose Color" },
  start_now: { vi: "Bắt đầu ngay", en: "Start Now" },
  no_habits: { vi: "Chưa có thói quen nào được tạo", en: "No habits created yet" },
  days_streak: { vi: "ngày", en: "days" },

  // Goal Tracker
  goal_tracker_title: { vi: "Mục tiêu học tập", en: "Learning Goals" },
  your_goals: { vi: "Mục tiêu của bạn", en: "Your Goals" },
  create_goal: { vi: "Tạo mục tiêu", en: "Create Goal" },
  active_goals: { vi: "Đang thực hiện", en: "In Progress" },
  completed_goals_label: { vi: "Đã hoàn thành", en: "Completed" },
  total_goals: { vi: "Tổng mục tiêu", en: "Total Goals" },
  no_goals: { vi: "Chưa có mục tiêu nào", en: "No goals yet" },
  no_goals_desc: { vi: "Đặt mục tiêu để theo dõi tiến độ học tập", en: "Set goals to track your learning progress" },
  create_first_goal: { vi: "Tạo mục tiêu đầu tiên", en: "Create First Goal" },
  expired: { vi: "Đã hết hạn", en: "Expired" },
  completed_badge: { vi: "✓ Hoàn thành!", en: "✓ Completed!" },
  manual_update: { vi: "cập nhật thủ công", en: "manual update" },
  goal_name_label: { vi: "Tên mục tiêu", en: "Goal Name" },
  goal_target_label: { vi: "Mục tiêu", en: "Target" },
  deadline_label: { vi: "Thời hạn", en: "Deadline" },
  end_date_label: { vi: "Ngày kết thúc", en: "End Date" },
  note_optional: { vi: "Ghi chú (tuỳ chọn)", en: "Note (optional)" },
  goal_name_placeholder: { vi: "VD: Đạt 80% trong tuần này", en: "E.g. Achieve 80% this week" },
  note_placeholder: { vi: "Mô tả thêm về mục tiêu...", en: "Describe your goal..." },
  delete_goal: { vi: "Xóa mục tiêu này?", en: "Delete this goal?" },
};

export const subjects = [
  "Toán học",
  "Ngữ văn",
  "Tiếng Anh",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lý",
  "Giáo dục công dân",
  "Công nghệ",
  "Tin học",
  "Nghệ thuật",
  "Thể dục",
  "Khác"
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
