// CHẾ ĐỘ CHẠY TRỰC TIẾP TRÊN FRONTEND (Lưu ý: Dễ bị lộ API Key)
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export const aiService = {
  async chat(message: string, context?: string) {
    if (!OPENROUTER_API_KEY) {
      return "Lỗi: Chưa cấu hình API Key OpenRouter";
    }

    // Danh sách model Free 2026
    const models = [
      "google/gemma-4-26b-a4b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "openrouter/free"
    ];

    for (const model of models) {
      try {
        console.log(`🌐 Gọi AI trực tiếp từ trình duyệt: ${model}...`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin, // Cần thiết khi gọi từ trình duyệt
            "X-Title": "StudyHub Demo"
          },
          body: JSON.stringify({
            "model": model,
            "messages": [
              { "role": "system", "content": "Bạn là StudyBuddy. Trả lời bằng tiếng Việt." },
              { "role": "user", "content": context ? `Ghi chú: ${context}\n\nHỏi: ${message}` : message }
            ]
          })
        });

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err) {
        console.warn(`${model} lỗi hoặc bị chặn CORS.`);
        continue;
      }
    }

    return "Lỗi: Trình duyệt không thể kết nối tới AI (CORS block) hoặc hết hạn mức.";
  },

  async generateFlashcards(content: string) {
    return this.chat(`Tạo 5 flashcards JSON (front, back) từ: ${content}`);
  },

  async generateQuiz(content: string) {
    const prompt = `Dựa trên nội dung tài liệu sau, hãy tạo ra 5 câu hỏi trắc nghiệm (mỗi câu 4 đáp án, 1 đáp án đúng). 
    Trả về kết quả dưới dạng mảng JSON duy nhất với cấu trúc: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}]
    
    Nội dung tài liệu: ${content.substring(0, 10000)}`; // Giới hạn 10k ký tự để tránh quá tải
    
    const response = await this.chat(prompt);
    
    // Cố gắng parse JSON từ phản hồi của AI
    try {
      const jsonStr = response.match(/\[[\s\S]*\]/)?.[0] || response;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Lỗi parse Quiz JSON:", e);
      return null;
    }
  }
};
