// Bridge to Internal API Route (Server-side proxy)
export const aiService = {
  // Chat with Grok 4 via our secure server route
  async chat(message: string, context?: string) {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message, context })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Lỗi server AI");
      }

      return data.content;
    } catch (error: any) {
      console.error("aiService error:", error);
      return `Xin lỗi, tôi gặp lỗi: ${error.message}`;
    }
  },

  async generateFlashcards(content: string) {
    // Tạm thời dùng chung chat route cho đơn giản
    return this.chat(`Tạo 5 thẻ ghi nhớ JSON (front, back) từ: ${content}. Chỉ trả về JSON array.`);
  }
};
