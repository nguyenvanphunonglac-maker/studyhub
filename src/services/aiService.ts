// Gọi AI qua Server Route (an toàn, không lộ key, không bị CORS)
export const aiService = {
  async chat(message: string, context?: string) {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi server AI");
      return data.content;
    } catch (error: any) {
      console.error("aiService error:", error);
      return `Xin lỗi, tôi gặp lỗi: ${error.message}`;
    }
  },

  async generateFlashcards(content: string) {
    return this.chat(`Tạo 5 flashcards JSON array (front, back) từ nội dung: ${content}`);
  }
};
