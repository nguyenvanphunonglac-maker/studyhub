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
