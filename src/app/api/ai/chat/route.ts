import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình API Key OpenRouter' }, { status: 500 });
    }

    const systemPrompt = "Bạn là trợ lý StudyBuddy. Trả lời bằng tiếng Việt, thân thiện và sử dụng Markdown.";
    
    // DANH SÁCH MODEL MIỄN PHÍ CẬP NHẬT THÁNG 4/2026
    const models = [
      "google/gemma-4-26b-a4b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "openai/gpt-oss-120b:free",
      "openrouter/free" 
    ];

    let errorDetails = "";

    for (const model of models) {
      try {
        console.log(`📡 Đang kết nối tới model 2026: ${model}...`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "StudyHub"
          },
          body: JSON.stringify({
            "model": model,
            "messages": [
              { "role": "system", "content": systemPrompt },
              { "role": "user", "content": context ? `Ghi chú: ${context}\n\nHỏi: ${message}` : message }
            ]
          }),
          signal: AbortSignal.timeout(20000) 
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ content: data.choices[0].message.content });
        }
        
        errorDetails += `${model}: ${data.error?.message || response.statusText}\n`;
      } catch (err: any) {
        errorDetails += `${model}: ${err.message}\n`;
        continue;
      }
    }

    return NextResponse.json({ 
      error: `Hệ thống AI 2026 đang bận. Chi tiết:\n${errorDetails}` 
    }, { status: 503 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
